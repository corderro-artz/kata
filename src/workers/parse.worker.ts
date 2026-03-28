import { inferFormat } from '../lib/formats'
import type {
  FlatNode,
  ParsedDocument,
  ParseRequest,
  ParseResponse,
  SourceFormat,
  ValueKind,
} from '../lib/types'

const scope = self as unknown as Worker

scope.onmessage = (event: MessageEvent<ParseRequest>) => {
  void handleRequest(event.data)
}

async function handleRequest(request: ParseRequest): Promise<void> {
  try {
    if (request.type === 'parse-file') {
      const sourceName = request.sourceName ?? request.file.name
      const text = await readFileWithProgress(request.file, sourceName)
      const document = await parseDocument(
        text,
        sourceName,
        request.formatHint ?? inferFormat(sourceName, request.file.type),
        request.file.size,
      )

      post({ type: 'parsed', document })
      return
    }

    const document = await parseDocument(
      request.text,
      request.sourceName,
      request.formatHint ?? inferFormat(request.sourceName),
      request.text.length,
    )

    post({ type: 'parsed', document })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error'
    post({ type: 'error', message })
  }
}

async function readFileWithProgress(file: File, sourceName: string): Promise<string> {
  if (!file.stream) {
    return file.text()
  }

  const reader = file.stream().getReader()
  const decoder = new TextDecoder()
  let text = ''
  let loaded = 0
  let chunkCounter = 0

  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      text += decoder.decode()
      break
    }

    loaded += value.byteLength
    text += decoder.decode(value, { stream: true })
    chunkCounter += 1

    if (chunkCounter % 2 === 0 || loaded === file.size) {
      post({
        type: 'progress',
        phase: 'read',
        loaded,
        total: file.size,
        previewText: text.slice(0, 12000),
        sourceName,
      })
    }
  }

  return text
}

async function parseDocument(
  text: string,
  sourceName: string,
  format: SourceFormat,
  size: number,
): Promise<ParsedDocument> {
  const startedAt = performance.now()

  post({
    type: 'progress',
    phase: 'parse',
    loaded: size,
    total: size,
    previewText: text.slice(0, 12000),
    sourceName,
  })

  const diagnostics: string[] = []
  let structuredData: unknown | null = null

  switch (format) {
    case 'json': {
      structuredData = parseJson(text, diagnostics)
      break
    }
    case 'yaml': {
      const yaml = await import('yaml')
      structuredData = yaml.parse(text)
      diagnostics.push('YAML parser lazy-loaded in worker.')
      break
    }
    case 'toml': {
      const toml = await import('smol-toml')
      structuredData = toml.parse(text)
      diagnostics.push('TOML parser lazy-loaded in worker.')
      break
    }
    case 'ini': {
      const ini = await import('ini')
      structuredData = ini.parse(text)
      diagnostics.push('INI parser lazy-loaded in worker.')
      break
    }
    case 'markdown': {
      const { micromark } = await import('micromark')
      structuredData = buildMarkdownOutline(text, sourceName)
      micromark(text)
      diagnostics.push('Markdown tokenized through micromark in worker.')
      break
    }
    default: {
      structuredData = buildTextFallback(text)
      diagnostics.push('Plain text fallback model generated.')
      break
    }
  }

  const flat = buildFlatModel(structuredData, sourceName)
  const lineCount = text.length === 0 ? 0 : text.split(/\r?\n/).length
  const parseMs = Math.round((performance.now() - startedAt) * 100) / 100

  return {
    sourceName,
    format,
    size,
    text,
    previewText: text.slice(0, 12000),
    rootId: 0,
    nodes: flat.nodes,
    childIds: Uint32Array.from(flat.childIds),
    stats: {
      nodeCount: flat.nodes.length,
      leafCount: flat.leafCount,
      maxDepth: flat.maxDepth,
      lineCount,
      parseMs,
    },
    diagnostics,
    structuredData,
  }
}

function parseJson(text: string, diagnostics: string[]): unknown {
  try {
    const parsed = JSON.parse(text)
    diagnostics.push('JSON fast path via JSON.parse succeeded.')
    return parsed
  } catch (error) {
    diagnostics.push('Fast-path JSON parse failed. Falling back to tolerant cleanup.')
    const recovered = JSON.parse(
      text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/,\s*([}\]])/g, '$1'),
    )
    if (error instanceof Error) {
      diagnostics.push(error.message)
    }
    diagnostics.push('Tolerant JSON fallback recovered the document.')
    return recovered
  }
}

function buildMarkdownOutline(text: string, sourceName: string): Record<string, unknown> {
  const lines = text.split(/\r?\n/)
  const sections: Array<Record<string, unknown>> = []
  let current = {
    heading: 'Preamble',
    level: 1,
    lines: [] as string[],
  }

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line)
    if (headingMatch) {
      if (current.lines.length > 0 || sections.length === 0) {
        sections.push({
          heading: current.heading,
          level: current.level,
          body: current.lines.join('\n').trim(),
          lineCount: current.lines.length,
        })
      }

      current = {
        heading: headingMatch[2],
        level: headingMatch[1].length,
        lines: [],
      }
      continue
    }

    current.lines.push(line)
  }

  sections.push({
    heading: current.heading,
    level: current.level,
    body: current.lines.join('\n').trim(),
    lineCount: current.lines.length,
  })

  return {
    title: sourceName,
    format: 'markdown',
    lineCount: lines.length,
    sections,
  }
}

function buildTextFallback(text: string): Record<string, unknown> {
  const lines = text.split(/\r?\n/)
  return {
    format: 'text',
    lineCount: lines.length,
    sample: lines.slice(0, 24),
  }
}

function buildFlatModel(structuredData: unknown, sourceName: string): {
  nodes: FlatNode[]
  childIds: number[]
  leafCount: number
  maxDepth: number
} {
  const normalizedRoot = wrapRoot(structuredData, sourceName)
  const nodes: FlatNode[] = [createNode(0, -1, 0, 'root', normalizedRoot)]
  const childIds: number[] = []
  const queue: Array<{ id: number; value: unknown; depth: number }> = [
    { id: 0, value: normalizedRoot, depth: 0 },
  ]
  let pointer = 0
  let leafCount = 0
  let maxDepth = 0

  while (pointer < queue.length) {
    const current = queue[pointer]
    pointer += 1

    const entries = collectEntries(current.value)
    const node = nodes[current.id]

    if (entries.length === 0) {
      leafCount += 1
      continue
    }

    node.childStart = childIds.length

    for (const entry of entries) {
      const childId = nodes.length
      const childNode = createNode(childId, current.id, current.depth + 1, entry.key, entry.value)
      nodes.push(childNode)
      childIds.push(childId)
      queue.push({ id: childId, value: entry.value, depth: current.depth + 1 })
      maxDepth = Math.max(maxDepth, childNode.depth)
    }

    node.childEnd = childIds.length
  }

  return { nodes, childIds, leafCount, maxDepth }
}

function wrapRoot(value: unknown, sourceName: string): unknown {
  if (value !== null && typeof value === 'object') {
    return value
  }

  return {
    source: sourceName,
    value,
  }
}

function collectEntries(value: unknown): Array<{ key: string; value: unknown }> {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({ key: `[${index}]`, value: item }))
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).map(([key, child]) => ({ key, value: child }))
  }

  return []
}

function createNode(
  id: number,
  parentId: number,
  depth: number,
  key: string,
  value: unknown,
): FlatNode {
  const isArray = Array.isArray(value)
  const isObject = value !== null && typeof value === 'object' && !isArray && !(value instanceof Date)
  const kind = isArray ? 'array' : isObject ? 'object' : 'value'

  return {
    id,
    parentId,
    depth,
    kind,
    key,
    label: key,
    value: summarizeValue(value),
    valueKind: getValueKind(value),
    childStart: 0,
    childEnd: 0,
    meta: 0,
  }
}

function summarizeValue(value: unknown): string | null {
  if (Array.isArray(value)) {
    return `${value.length} item${value.length === 1 ? '' : 's'}`
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>)
    return `${keys.length} key${keys.length === 1 ? '' : 's'}`
  }

  if (typeof value === 'string') {
    return value.length > 96 ? `${value.slice(0, 93)}...` : value
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }

  if (value === null) {
    return 'null'
  }

  if (value === undefined) {
    return 'undefined'
  }

  return null
}

function getValueKind(value: unknown): ValueKind {
  if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
    return 'container'
  }

  if (value instanceof Date) {
    return 'date'
  }

  if (value === null) {
    return 'null'
  }

  switch (typeof value) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    default:
      return 'unknown'
  }
}

function post(message: ParseResponse): void {
  scope.postMessage(message)
}