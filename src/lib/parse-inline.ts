import type { FlatNode, ParsedDocument, ValueKind } from './types'

const INLINE_SIZE_LIMIT = 65_536

export function canParseInline(text: string, format: string): boolean {
  return format === 'json' && text.length <= INLINE_SIZE_LIMIT
}

export function parseInline(text: string, sourceName: string): ParsedDocument {
  const startedAt = performance.now()
  const diagnostics: string[] = []

  let structuredData: unknown
  try {
    structuredData = JSON.parse(text)
    diagnostics.push('JSON fast path via JSON.parse succeeded.')
  } catch {
    structuredData = JSON.parse(
      text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/,\s*([}\]])/g, '$1'),
    )
    diagnostics.push('Tolerant JSON fallback recovered the document.')
  }

  const root = structuredData !== null && typeof structuredData === 'object'
    ? structuredData
    : { source: sourceName, value: structuredData }

  const nodes: FlatNode[] = [createNode(0, -1, 0, 'root', root)]
  const childIds: number[] = []
  const queue: Array<{ id: number; value: unknown; depth: number }> = [
    { id: 0, value: root, depth: 0 },
  ]
  let pointer = 0
  let leafCount = 0
  let maxDepth = 0

  while (pointer < queue.length) {
    const current = queue[pointer++]
    const entries = collectEntries(current.value)
    const node = nodes[current.id]

    if (entries.length === 0) {
      leafCount++
      continue
    }

    node.childStart = childIds.length

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const childId = nodes.length
      const childDepth = current.depth + 1
      nodes.push(createNode(childId, current.id, childDepth, entry.key, entry.value))
      childIds.push(childId)
      queue.push({ id: childId, value: entry.value, depth: childDepth })
      if (childDepth > maxDepth) maxDepth = childDepth
    }

    node.childEnd = childIds.length
  }

  let lineCount = 1
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) lineCount++
  }

  const parseMs = Math.round((performance.now() - startedAt) * 100) / 100

  return {
    sourceName,
    format: 'json',
    size: text.length,
    text,
    previewText: text.length > 12000 ? text.slice(0, 12000) : text,
    rootId: 0,
    nodes,
    childIds: Uint32Array.from(childIds),
    stats: {
      nodeCount: nodes.length,
      leafCount,
      maxDepth,
      lineCount,
      parseMs,
    },
    diagnostics,
    structuredData,
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
  if (value instanceof Date) return value.toISOString()
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
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  return null
}

function getValueKind(value: unknown): ValueKind {
  if (Array.isArray(value) || (value !== null && typeof value === 'object')) return 'container'
  if (value instanceof Date) return 'date'
  if (value === null) return 'null'
  switch (typeof value) {
    case 'string': return 'string'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    default: return 'unknown'
  }
}
