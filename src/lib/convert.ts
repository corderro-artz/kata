/**
 * Every format conversion Kata performs, in both directions.
 *
 * This module is deliberately free of DOM and worker globals so that the
 * workers and `scripts/format-parity.mjs` run the same code. Heavy parsers are
 * loaded with `await import()` at the point of use, so importing this module
 * costs nothing until a format is actually needed.
 */
import { getFormatSpec } from './registry'
import type { FormatId } from './types'

export interface ParseResult {
  data: unknown
  diagnostics: string[]
}

export interface SerializeContext {
  sourceName: string
  /** Format the document was read from, so exporters can pass text through. */
  sourceFormat: FormatId
  /** Original document text, for the pass-through cases. */
  sourceText: string
}

export interface SerializeResult {
  text: string
  /** Fidelity warnings. An exporter that loses data must say so here. */
  notes: string[]
}

const KATA_ROOT_MARKER = 'kata-root-scalar'
const XML_WRAPPER = 'KataDocument'

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export async function parseFormat(
  text: string,
  format: FormatId,
  sourceName: string,
): Promise<ParseResult> {
  const diagnostics: string[] = []

  switch (format) {
    case 'json':
      return { data: parseJsonTolerant(text, diagnostics), diagnostics }

    case 'jsonc':
      diagnostics.push('Comments and trailing commas stripped before parsing.')
      return { data: parseJsonTolerant(text, diagnostics), diagnostics }

    case 'yaml': {
      const yaml = await import('yaml')
      diagnostics.push('YAML parser lazy-loaded in worker.')
      return { data: yaml.parse(text), diagnostics }
    }

    case 'toml': {
      const toml = await import('smol-toml')
      diagnostics.push('TOML parser lazy-loaded in worker.')
      return { data: unwrapScalarRoot(toml.parse(text), text, diagnostics), diagnostics }
    }

    case 'ini': {
      const ini = await import('ini')
      diagnostics.push('INI parser lazy-loaded in worker.')
      const parsed = coerceStringsDeep(ini.parse(text))
      diagnostics.push('INI values coerced back to numbers and booleans where they round-trip exactly.')
      return { data: unwrapScalarRoot(parsed, text, diagnostics), diagnostics }
    }

    case 'markdown': {
      const { micromark } = await import('micromark')
      micromark(text)
      diagnostics.push('Markdown tokenized through micromark in worker.')
      return { data: buildMarkdownModel(text, sourceName, diagnostics), diagnostics }
    }

    case 'xml': {
      const data = await parseXmlDocument(text, diagnostics)
      return { data, diagnostics }
    }

    case 'xaml': {
      const data = await parseXamlDocument(text, diagnostics)
      return { data, diagnostics }
    }

    case 'csv':
      return { data: parseDelimitedDocument(text, ',', diagnostics), diagnostics }

    case 'tsv':
      return { data: parseDelimitedDocument(text, '\t', diagnostics), diagnostics }

    default:
      return { data: parseTextDocument(text, diagnostics), diagnostics }
  }
}

function parseJsonTolerant(text: string, diagnostics: string[]): unknown {
  try {
    const parsed = JSON.parse(text)
    diagnostics.push('JSON fast path via JSON.parse succeeded.')
    return parsed
  } catch (error) {
    diagnostics.push('Fast-path JSON parse failed. Falling back to tolerant cleanup.')
    const recovered = JSON.parse(stripJsonComments(text))
    if (error instanceof Error) {
      diagnostics.push(error.message)
    }
    diagnostics.push('Tolerant JSON fallback recovered the document.')
    return recovered
  }
}

/**
 * Strips `//` and block comments and trailing commas without touching the
 * inside of string literals — a naive regex corrupts any document containing
 * a URL.
 */
export function stripJsonComments(text: string): string {
  let out = ''
  let index = 0
  let inString = false
  let inLine = false
  let inBlock = false

  while (index < text.length) {
    const char = text[index]
    const next = text[index + 1]

    if (inLine) {
      if (char === '\n') {
        inLine = false
        out += char
      }
      index += 1
      continue
    }

    if (inBlock) {
      if (char === '*' && next === '/') {
        inBlock = false
        index += 2
        continue
      }
      if (char === '\n') {
        out += char
      }
      index += 1
      continue
    }

    if (inString) {
      out += char
      if (char === '\\') {
        out += text[index + 1] ?? ''
        index += 2
        continue
      }
      if (char === '"') {
        inString = false
      }
      index += 1
      continue
    }

    if (char === '"') {
      inString = true
      out += char
      index += 1
      continue
    }

    if (char === '/' && next === '/') {
      inLine = true
      index += 2
      continue
    }

    if (char === '/' && next === '*') {
      inBlock = true
      index += 2
      continue
    }

    out += char
    index += 1
  }

  return out.replace(/,(\s*[}\]])/g, '$1')
}

// ---------------------------------------------------------------------------
// Serializing
// ---------------------------------------------------------------------------

export async function serializeFormat(
  value: unknown,
  format: FormatId,
  context: SerializeContext,
): Promise<SerializeResult> {
  const spec = getFormatSpec(format)
  if (!spec.canSerialize) {
    throw new Error(`${spec.label} is an input-only format.`)
  }

  const notes: string[] = []
  const prepared = prepareValue(value)

  switch (format) {
    case 'yaml': {
      const YAML = await import('yaml')
      return { text: YAML.stringify(prepared), notes }
    }

    case 'toml': {
      const { stringify } = await import('smol-toml')
      const dropped: string[] = []
      const safe = stripNulls(prepared, '', dropped)
      if (dropped.length > 0) {
        notes.push(
          `TOML cannot represent null. Dropped ${dropped.length} entr${dropped.length === 1 ? 'y' : 'ies'}: ${summarizeKeys(dropped)}`,
        )
      }
      const { root, wrapped } = toTableRoot(safe)
      const body = stringify(root)
      return { text: wrapped ? `#${KATA_ROOT_MARKER}\n${body}` : body, notes }
    }

    case 'ini': {
      const ini = await import('ini')
      const { root, wrapped } = toTableRoot(prepared)
      const coerced: string[] = []
      collectTypedKeys(root, '', coerced)
      if (coerced.length > 0) {
        notes.push(
          `INI stores values as text. ${coerced.length} non-string value${coerced.length === 1 ? '' : 's'} will re-import as text unless exactly recoverable: ${summarizeKeys(coerced)}`,
        )
      }
      const body = ini.stringify(root)
      return { text: wrapped ? `;${KATA_ROOT_MARKER}\n${body}` : body, notes }
    }

    case 'markdown':
      return {
        text: context.sourceFormat === 'markdown'
          ? context.sourceText
          : toMarkdown(prepared, context.sourceName),
        notes: context.sourceFormat === 'markdown'
          ? notes
          : [...notes, 'Markdown is an outline of the data, not a reversible encoding of it.'],
      }

    case 'xml': {
      const { XMLBuilder } = await import('fast-xml-parser')
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        format: true,
        indentBy: '  ',
        suppressEmptyNode: true,
      })
      const tree = { [XML_WRAPPER]: encodeXmlValue(prepared, notes) }
      return { text: `<?xml version="1.0" encoding="utf-8"?>\n${builder.build(tree)}`.trimEnd(), notes }
    }

    case 'xaml':
      return { text: toXaml(prepared, context.sourceName), notes }

    case 'csv':
      return toDelimited(prepared, ',', notes)

    case 'tsv':
      return toDelimited(prepared, '\t', notes)

    case 'text': {
      if (context.sourceFormat === 'text') {
        return { text: context.sourceText, notes }
      }

      const ambiguous: string[] = []
      collectTypedKeys(prepared, '', ambiguous)
      if (ambiguous.length > 0) {
        notes.push(
          `Dotted-path text is untyped. ${ambiguous.length} value${ambiguous.length === 1 ? '' : 's'} will change type on re-import: ${summarizeKeys(ambiguous)}`,
        )
      }

      return { text: toText(prepared, context.sourceName), notes }
    }

    default:
      return { text: JSON.stringify(prepared, null, 2), notes }
  }
}

export function prepareValue(value: unknown): unknown {
  if (value === undefined) {
    return null
  }

  if (value === null) {
    return null
  }

  if (Array.isArray(value)) {
    return value.map((entry) => prepareValue(entry))
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, prepareValue(child)]),
    )
  }

  return value
}

// ---------------------------------------------------------------------------
// Scalar-root handling (TOML and INI can only hold a table at the top level)
// ---------------------------------------------------------------------------

function toTableRoot(value: unknown): { root: Record<string, unknown>; wrapped: boolean } {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return { root: value as Record<string, unknown>, wrapped: false }
  }

  return { root: { value }, wrapped: true }
}

function unwrapScalarRoot(parsed: unknown, text: string, diagnostics: string[]): unknown {
  if (!text.includes(KATA_ROOT_MARKER)) {
    return parsed
  }

  if (
    parsed !== null
    && typeof parsed === 'object'
    && !Array.isArray(parsed)
    && Object.keys(parsed as Record<string, unknown>).length === 1
    && 'value' in (parsed as Record<string, unknown>)
  ) {
    diagnostics.push('Scalar root unwrapped from its Kata table wrapper.')
    return (parsed as Record<string, unknown>).value
  }

  return parsed
}

function stripNulls(value: unknown, path: string, dropped: string[]): unknown {
  if (Array.isArray(value)) {
    // smol-toml throws on a null array entry, so they are removed rather than
    // allowed to abort the whole export. The caller reports every removal.
    const out: unknown[] = []
    value.forEach((entry, index) => {
      const entryPath = `${path}[${index}]`
      if (entry === null || entry === undefined) {
        dropped.push(entryPath)
        return
      }
      out.push(stripNulls(entry, entryPath, dropped))
    })
    return out
  }

  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const childPath = path ? `${path}.${key}` : key
      if (child === null || child === undefined) {
        dropped.push(childPath)
        continue
      }
      out[key] = stripNulls(child, childPath, dropped)
    }
    return out
  }

  return value
}

function collectTypedKeys(value: unknown, path: string, out: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectTypedKeys(entry, `${path}[${index}]`, out))
    return
  }

  if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      collectTypedKeys(child, path ? `${path}.${key}` : key, out)
    }
    return
  }

  if (typeof value === 'number' && String(value) !== String(Number(String(value)))) {
    out.push(path)
    return
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    // Recoverable on import: String(Number(x)) === x, or 'true'/'false'.
    return
  }

  if (typeof value === 'string' && coerceScalar(value) !== value) {
    // A string that looks like a number will come back as a number.
    out.push(path)
  }
}

function summarizeKeys(keys: string[]): string {
  const shown = keys.slice(0, 5).join(', ')
  return keys.length > 5 ? `${shown}, and ${keys.length - 5} more` : shown
}

/** Recovers numbers, booleans and null from text, but only when exact. */
export function coerceScalar(raw: string): unknown {
  if (raw === 'null') return null
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (raw !== '' && raw.trim() === raw && String(Number(raw)) === raw) {
    return Number(raw)
  }
  return raw
}

function coerceStringsDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => coerceStringsDeep(entry))
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, coerceStringsDeep(child)]),
    )
  }

  return typeof value === 'string' ? coerceScalar(value) : value
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

function buildMarkdownModel(
  text: string,
  sourceName: string,
  diagnostics: string[],
): Record<string, unknown> {
  const { frontMatter, body } = splitFrontMatter(text)
  const lines = body.split(/\r?\n/)
  const sections: Array<Record<string, unknown>> = []

  let current = { heading: 'Preamble', level: 1, lines: [] as string[] }

  const flush = () => {
    const raw = current.lines.join('\n').trim()
    const section: Record<string, unknown> = {
      heading: current.heading,
      level: current.level,
      body: raw,
      lineCount: current.lines.length,
    }

    const tables = extractTables(current.lines)
    if (tables.length > 0) {
      section.tables = tables
      diagnostics.push(`Parsed ${tables.length} Markdown table${tables.length === 1 ? '' : 's'} into records.`)
    }

    sections.push(section)
  }

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line)
    if (headingMatch) {
      if (current.lines.length > 0 || sections.length === 0) {
        flush()
      }

      current = { heading: headingMatch[2], level: headingMatch[1].length, lines: [] }
      continue
    }

    current.lines.push(line)
  }

  flush()

  const model: Record<string, unknown> = {
    title: sourceName,
    format: 'markdown',
    lineCount: lines.length,
    sections,
  }

  if (frontMatter) {
    model.frontMatter = frontMatter
    diagnostics.push('YAML front matter parsed into structured data.')
  }

  return model
}

function splitFrontMatter(text: string): { frontMatter: Record<string, unknown> | null; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) {
    return { frontMatter: null, body: text }
  }

  const frontMatter = parseSimpleYamlBlock(match[1])
  return { frontMatter, body: text.slice(match[0].length) }
}

/**
 * Front matter is parsed without pulling in the YAML module, which would defeat
 * the lazy loading everywhere else. Handles the flat `key: value` and
 * `key:\n  - item` shapes that front matter actually uses.
 */
function parseSimpleYamlBlock(block: string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const lines = block.split(/\r?\n/)
  let listKey: string | null = null

  for (const line of lines) {
    if (line.trim() === '' || line.trim().startsWith('#')) {
      continue
    }

    const listMatch = /^\s*-\s+(.*)$/.exec(line)
    if (listMatch && listKey) {
      ;(out[listKey] as unknown[]).push(coerceScalar(unquote(listMatch[1].trim())))
      continue
    }

    const pairMatch = /^([A-Za-z0-9_.$-]+)\s*:\s*(.*)$/.exec(line)
    if (!pairMatch) {
      continue
    }

    const [, key, rawValue] = pairMatch
    if (rawValue.trim() === '') {
      listKey = key
      out[key] = []
      continue
    }

    listKey = null
    const inline = /^\[(.*)\]$/.exec(rawValue.trim())
    out[key] = inline
      ? inline[1].split(',').map((entry) => coerceScalar(unquote(entry.trim()))).filter((entry) => entry !== '')
      : coerceScalar(unquote(rawValue.trim()))
  }

  return out
}

function unquote(value: string): string {
  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1)
  }
  return value
}

function extractTables(lines: string[]): Array<Array<Record<string, unknown>>> {
  const tables: Array<Array<Record<string, unknown>>> = []

  for (let index = 0; index < lines.length; index += 1) {
    const header = lines[index]
    const divider = lines[index + 1]
    if (!isTableRow(header) || !divider || !/^\s*\|?[\s:|-]+\|?\s*$/.test(divider) || !divider.includes('-')) {
      continue
    }

    const columns = splitTableRow(header)
    const rows: Array<Record<string, unknown>> = []
    let cursor = index + 2

    while (cursor < lines.length && isTableRow(lines[cursor])) {
      const cells = splitTableRow(lines[cursor])
      const row: Record<string, unknown> = {}
      columns.forEach((column, columnIndex) => {
        row[column] = coerceScalar(cells[columnIndex] ?? '')
      })
      rows.push(row)
      cursor += 1
    }

    if (rows.length > 0) {
      tables.push(rows)
    }

    index = cursor - 1
  }

  return tables
}

function isTableRow(line: string | undefined): boolean {
  return typeof line === 'string' && line.includes('|') && line.trim().length > 0
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function toMarkdown(value: unknown, sourceName: string): string {
  const lines: string[] = [`# ${sourceName}`, '']
  const stack: Array<{ value: unknown; label: string; depth: number }> = [
    { value, label: 'Root', depth: 2 },
  ]

  while (stack.length > 0) {
    const current = stack.pop()!

    if (Array.isArray(current.value)) {
      lines.push(`${'#'.repeat(Math.min(current.depth, 6))} ${current.label}`)
      lines.push('')

      if (current.value.length === 0) {
        lines.push('- (empty)')
        lines.push('')
        continue
      }

      const table = renderTable(current.value)
      if (table) {
        lines.push(...table, '')
        continue
      }

      for (let index = current.value.length - 1; index >= 0; index -= 1) {
        stack.push({
          value: current.value[index],
          label: `${current.label} ${index}`,
          depth: current.depth + 1,
        })
      }
      continue
    }

    if (current.value !== null && typeof current.value === 'object') {
      lines.push(`${'#'.repeat(Math.min(current.depth, 6))} ${current.label}`)
      lines.push('')
      const entries = Object.entries(current.value as Record<string, unknown>)

      if (entries.length === 0) {
        lines.push('- (empty)')
        lines.push('')
        continue
      }

      for (let index = entries.length - 1; index >= 0; index -= 1) {
        const [key, child] = entries[index]
        stack.push({ value: child, label: key, depth: current.depth + 1 })
      }
      continue
    }

    lines.push(`- ${current.label}: ${String(current.value)}`)
    lines.push('')
  }

  return lines.join('\n').trim()
}

/** Renders an array of flat records as a GFM table, or null if it is not one. */
function renderTable(rows: unknown[]): string[] | null {
  if (rows.length === 0) {
    return null
  }

  const columns: string[] = []
  for (const row of rows) {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) {
      return null
    }
    for (const [key, cell] of Object.entries(row as Record<string, unknown>)) {
      if (cell !== null && typeof cell === 'object') {
        return null
      }
      if (!columns.includes(key)) {
        columns.push(key)
      }
    }
  }

  if (columns.length === 0) {
    return null
  }

  const escapeCell = (cell: unknown) => String(cell ?? '').replaceAll('|', '\\|')

  return [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => {
      const record = row as Record<string, unknown>
      return `| ${columns.map((column) => escapeCell(record[column])).join(' | ')} |`
    }),
  ]
}

// ---------------------------------------------------------------------------
// Plain text
// ---------------------------------------------------------------------------

// A path starts with a key, or with `[0]` when the document root is an array.
const TEXT_PATH_LINE = /^([A-Za-z0-9_$[][^\s=]*)\s=\s(.*)$/

function toText(value: unknown, sourceName: string): string {
  const lines: string[] = [`# ${sourceName}`]

  // A scalar or empty root collapses to a single `value = …` line, which reads
  // exactly like a document that genuinely has one `value` key. The marker
  // tells the importer which of the two it is looking at.
  if (isScalarOrEmptyRoot(value)) {
    lines.push(`#${KATA_ROOT_MARKER}`)
  }

  lines.push('')
  flattenText('', value, lines)
  return lines.join('\n')
}

function isScalarOrEmptyRoot(value: unknown): boolean {
  if (value === null || typeof value !== 'object') {
    return true
  }

  return Array.isArray(value)
    ? value.length === 0
    : Object.keys(value as Record<string, unknown>).length === 0
}

function flattenText(prefix: string, value: unknown, lines: string[]): void {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      lines.push(`${prefix || 'value'} = []`)
      return
    }
    for (let index = 0; index < value.length; index += 1) {
      flattenText(prefix ? `${prefix}[${index}]` : `[${index}]`, value[index], lines)
    }
    return
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      lines.push(`${prefix || 'value'} = {}`)
      return
    }
    for (const [key, child] of entries) {
      flattenText(prefix ? `${prefix}.${key}` : key, child, lines)
    }
    return
  }

  lines.push(`${prefix || 'value'} = ${value === null || value === undefined ? 'null' : String(value)}`)
}

/**
 * Rebuilds the object graph from Kata's own dotted-path export. Anything that
 * is not that shape falls back to a line sample — but says so, rather than
 * silently discarding the rest of the file.
 */
function parseTextDocument(text: string, diagnostics: string[]): Record<string, unknown> | unknown {
  const lines = text.split(/\r?\n/)
  const assignments: Array<{ path: string; value: string }> = []
  let otherContent = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue
    }

    // Match the raw line, not the trimmed one: a trailing space is the value
    // of an empty-string assignment, and trimming it drops the whole document
    // into the sample fallback.
    const match = TEXT_PATH_LINE.exec(line)
    if (match) {
      assignments.push({ path: match[1], value: match[2] })
      continue
    }

    otherContent += 1
  }

  if (assignments.length > 0 && otherContent === 0) {
    diagnostics.push(`Recovered ${assignments.length} dotted-path assignments from Kata text export.`)
    return rebuildFromPaths(assignments, text.includes(KATA_ROOT_MARKER))
  }

  const SAMPLE_LIMIT = 24
  if (lines.length > SAMPLE_LIMIT) {
    diagnostics.push(
      `Plain text fallback: showing the first ${SAMPLE_LIMIT} of ${lines.length} lines. The full text is available in the Raw view.`,
    )
  } else {
    diagnostics.push('Plain text fallback model generated.')
  }

  return {
    format: 'text',
    lineCount: lines.length,
    sample: lines.slice(0, SAMPLE_LIMIT),
  }
}

function rebuildFromPaths(
  assignments: Array<{ path: string; value: string }>,
  scalarRoot: boolean,
): unknown {
  const root: { value: unknown } = { value: undefined }

  for (const assignment of assignments) {
    const segments = parsePath(assignment.path)
    if (segments.length === 0) {
      continue
    }

    const literal = assignment.value === '{}'
      ? {}
      : assignment.value === '[]'
        ? []
        : coerceScalar(assignment.value)

    assignPath(root, segments, literal)
  }

  const result = root.value

  if (
    scalarRoot
    && result !== null
    && typeof result === 'object'
    && !Array.isArray(result)
    && 'value' in (result as Record<string, unknown>)
  ) {
    return (result as Record<string, unknown>).value
  }

  return result === undefined ? {} : result
}

type PathSegment = { kind: 'key'; key: string } | { kind: 'index'; index: number }

function parsePath(path: string): PathSegment[] {
  const segments: PathSegment[] = []
  const pattern = /([^.[\]]+)|\[(\d+)\]/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(path)) !== null) {
    if (match[2] !== undefined) {
      segments.push({ kind: 'index', index: Number(match[2]) })
    } else {
      segments.push({ kind: 'key', key: match[1] })
    }
  }

  return segments
}

function assignPath(root: { value: unknown }, segments: PathSegment[], literal: unknown): void {
  let containerHolder: { get(): unknown; set(next: unknown): void } = {
    get: () => root.value,
    set: (next) => { root.value = next },
  }

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index]
    const isLast = index === segments.length - 1
    const wantsArray = segment.kind === 'index'

    let container = containerHolder.get()
    if (wantsArray ? !Array.isArray(container) : container === null || typeof container !== 'object' || Array.isArray(container)) {
      container = wantsArray ? [] : {}
      containerHolder.set(container)
    }

    if (isLast) {
      if (segment.kind === 'index') {
        ;(container as unknown[])[segment.index] = literal
      } else {
        ;(container as Record<string, unknown>)[segment.key] = literal
      }
      return
    }

    const parent = container
    containerHolder = segment.kind === 'index'
      ? {
        get: () => (parent as unknown[])[segment.index],
        set: (next) => { (parent as unknown[])[segment.index] = next },
      }
      : {
        get: () => (parent as Record<string, unknown>)[segment.key],
        set: (next) => { (parent as Record<string, unknown>)[segment.key] = next },
      }
  }
}

// ---------------------------------------------------------------------------
// CSV / TSV
// ---------------------------------------------------------------------------

/** RFC 4180 reader. Handles quoted fields, escaped quotes and embedded newlines. */
export function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let index = 0
  let quoted = false

  const endField = () => {
    row.push(field)
    field = ''
  }

  const endRow = () => {
    endField()
    rows.push(row)
    row = []
  }

  while (index < text.length) {
    const char = text[index]

    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 2
          continue
        }
        quoted = false
        index += 1
        continue
      }
      field += char
      index += 1
      continue
    }

    if (char === '"' && field === '') {
      quoted = true
      index += 1
      continue
    }

    if (char === delimiter) {
      endField()
      index += 1
      continue
    }

    if (char === '\r' && text[index + 1] === '\n') {
      endRow()
      index += 2
      continue
    }

    if (char === '\n' || char === '\r') {
      endRow()
      index += 1
      continue
    }

    field += char
    index += 1
  }

  if (field !== '' || row.length > 0) {
    endRow()
  }

  return rows
}

function parseDelimitedDocument(text: string, delimiter: string, diagnostics: string[]): unknown {
  const rows = parseDelimited(text, delimiter)
  if (rows.length === 0) {
    diagnostics.push('Delimited document is empty.')
    return []
  }

  const [header, ...body] = rows
  const records = body
    .filter((cells) => cells.some((cell) => cell !== ''))
    .map((cells) => {
      const record: Record<string, unknown> = {}
      header.forEach((column, columnIndex) => {
        record[column || `column${columnIndex + 1}`] = decodeCell(cells[columnIndex] ?? '')
      })
      return record
    })

  diagnostics.push(`Parsed ${records.length} row${records.length === 1 ? '' : 's'} across ${header.length} column${header.length === 1 ? '' : 's'}.`)
  return records
}

/** Cells holding JSON objects or arrays are decoded back into structure. */
function decodeCell(cell: string): unknown {
  const trimmed = cell.trim()
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return cell
    }
  }
  return coerceScalar(cell)
}

function toDelimited(value: unknown, delimiter: string, notes: string[]): SerializeResult {
  const rows = toRecordArray(value, notes)
  const columns: string[] = []

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!columns.includes(key)) {
        columns.push(key)
      }
    }
  }

  if (columns.length === 0) {
    return { text: '', notes }
  }

  const encode = (cell: unknown): string => {
    if (cell === null || cell === undefined) return ''
    const raw = typeof cell === 'object' ? JSON.stringify(cell) : String(cell)
    const needsQuotes = raw.includes(delimiter) || raw.includes('"') || raw.includes('\n') || raw.includes('\r')
    return needsQuotes ? `"${raw.replaceAll('"', '""')}"` : raw
  }

  const lines = [
    columns.map(encode).join(delimiter),
    ...rows.map((row) => columns.map((column) => encode(row[column])).join(delimiter)),
  ]

  return { text: lines.join('\n'), notes }
}

function toRecordArray(value: unknown, notes: string[]): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    const allRecords = value.every((entry) => entry !== null && typeof entry === 'object' && !Array.isArray(entry))
    if (allRecords) {
      const nested = value.some((entry) =>
        Object.values(entry as Record<string, unknown>).some((cell) => cell !== null && typeof cell === 'object'))
      if (nested) {
        notes.push('Nested values were JSON-encoded into their cell so the table stays flat.')
      }
      return value as Array<Record<string, unknown>>
    }

    notes.push('Array of scalars written as a single "value" column.')
    return value.map((entry) => ({ value: entry }))
  }

  if (value !== null && typeof value === 'object') {
    notes.push('Document root is an object, so the table has a single row.')
    return [value as Record<string, unknown>]
  }

  notes.push('Document root is a scalar, so the table has one cell.')
  return [{ value }]
}

// ---------------------------------------------------------------------------
// XML
// ---------------------------------------------------------------------------

const XML_NAME = /^[A-Za-z_][A-Za-z0-9._-]*$/

interface XmlAttributes {
  [key: string]: string
}

function encodeXmlValue(value: unknown, notes: string[]): unknown {
  if (value === null) {
    return { '@_kata:type': 'null' }
  }

  if (Array.isArray(value)) {
    return {
      '@_kata:type': 'array',
      item: value.map((entry) => encodeXmlValue(entry, notes)),
    }
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      return { '@_kata:type': 'object' }
    }

    const out: Record<string, unknown> = {}
    for (const [key, child] of entries) {
      if (XML_NAME.test(key) && !key.startsWith('kata:')) {
        out[key] = encodeXmlValue(child, notes)
        continue
      }

      // Keys that are not valid XML names become entry elements that carry the
      // original key as an attribute, so nothing is silently renamed.
      const encoded = encodeXmlValue(child, notes)
      const entry = (encoded !== null && typeof encoded === 'object' && !Array.isArray(encoded))
        ? { ...(encoded as Record<string, unknown>), '@_kata:key': key }
        : { '#text': encoded, '@_kata:key': key }
      const bucket = out['kata:entry']
      out['kata:entry'] = Array.isArray(bucket) ? [...bucket, entry] : bucket ? [bucket, entry] : [entry]
      notes.push(`Key "${key}" is not a valid XML element name; written as a kata:entry element.`)
    }
    return out
  }

  if (typeof value === 'string') {
    // A string that would be read back as a number, boolean or null needs a
    // marker; everything else can be written bare.
    return coerceScalar(value) === value
      ? { '#text': value }
      : { '#text': value, '@_kata:type': 'string' }
  }

  return { '#text': String(value) }
}

async function parseXmlDocument(text: string, diagnostics: string[]): Promise<unknown> {
  const { XMLParser } = await import('fast-xml-parser')
  diagnostics.push('XML parser lazy-loaded in worker.')

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    preserveOrder: true,
    parseTagValue: false,
    parseAttributeValue: false,
    // Keep padding: trimming would silently rewrite a string on round-trip.
    trimValues: false,
  })

  const nodes = parser.parse(text) as OrderedNode[]
  const root = nodes.find((node) => {
    const tag = tagOf(node)
    return tag !== null && !tag.startsWith('?') && !tag.startsWith('!')
  })

  if (!root) {
    diagnostics.push('No XML root element found.')
    return {}
  }

  const rootTag = tagOf(root)!
  const decoded = decodeXmlElement(root)

  if (rootTag === XML_WRAPPER) {
    diagnostics.push('Kata XML wrapper unwrapped.')
    return decoded
  }

  return { [rootTag]: decoded }
}

type OrderedNode = Record<string, unknown>

function tagOf(node: OrderedNode): string | null {
  for (const key of Object.keys(node)) {
    if (key !== ':@') {
      return key
    }
  }
  return null
}

function attributesOf(node: OrderedNode): XmlAttributes {
  return (node[':@'] as XmlAttributes | undefined) ?? {}
}

function childrenOf(node: OrderedNode): OrderedNode[] {
  const tag = tagOf(node)
  if (tag === null) {
    return []
  }
  const value = node[tag]
  return Array.isArray(value) ? (value as OrderedNode[]) : []
}

function decodeXmlElement(node: OrderedNode): unknown {
  const attributes = attributesOf(node)
  const children = childrenOf(node)
  const kataType = attributes['@_kata:type']

  if (kataType === 'null') {
    return null
  }

  if (kataType === 'object') {
    return {}
  }

  if (kataType === 'array') {
    return children
      .filter((child) => tagOf(child) === 'item')
      .map((child) => decodeXmlElement(child))
  }

  const elementChildren = children.filter((child) => {
    const tag = tagOf(child)
    return tag !== null && tag !== '#text' && !tag.startsWith('?') && !tag.startsWith('!')
  })

  if (elementChildren.length === 0) {
    const text = children
      .filter((child) => tagOf(child) === '#text')
      .map((child) => String(child['#text'] ?? ''))
      .join('')

    const scalar = kataType === 'string' ? text : coerceScalar(text)
    const ownAttributes = foreignAttributes(attributes)

    if (Object.keys(ownAttributes).length === 0) {
      return scalar
    }

    return text === '' ? ownAttributes : { ...ownAttributes, '#text': scalar }
  }

  const out: Record<string, unknown> = { ...foreignAttributes(attributes) }

  for (const child of elementChildren) {
    const tag = tagOf(child)!
    const childAttributes = attributesOf(child)
    const key = tag === 'kata:entry' && childAttributes['@_kata:key'] !== undefined
      ? childAttributes['@_kata:key']
      : tag

    const decoded = decodeXmlElement(child)

    if (key in out) {
      const existing = out[key]
      out[key] = Array.isArray(existing) ? [...existing, decoded] : [existing, decoded]
    } else {
      out[key] = decoded
    }
  }

  return out
}

/** Attributes other than Kata's own encoding markers. */
function foreignAttributes(attributes: XmlAttributes): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith('@_kata:')) {
      continue
    }
    out[key] = coerceScalar(String(value))
  }
  return out
}

// ---------------------------------------------------------------------------
// XAML
// ---------------------------------------------------------------------------

function toXaml(value: unknown, sourceName: string): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"',
    '                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">',
    `  <x:String x:Key="SourceName">${escapeXml(sourceName)}</x:String>`,
  ]

  appendXamlNode(lines, value, 'Root', 1)
  lines.push('</ResourceDictionary>')
  return lines.join('\n')
}

function appendXamlNode(lines: string[], value: unknown, key: string | null, depth: number): void {
  const indent = '  '.repeat(depth)
  const keyAttribute = key === null ? '' : ` x:Key="${escapeXml(key)}"`

  if (value === null || value === undefined) {
    lines.push(`${indent}<x:Null${keyAttribute} />`)
    return
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      lines.push(`${indent}<x:Array${keyAttribute} Type="x:Object" />`)
      return
    }
    lines.push(`${indent}<x:Array${keyAttribute} Type="x:Object">`)
    for (const item of value) {
      appendXamlNode(lines, item, null, depth + 1)
    }
    lines.push(`${indent}</x:Array>`)
    return
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      lines.push(`${indent}<ResourceDictionary${keyAttribute} />`)
      return
    }
    lines.push(`${indent}<ResourceDictionary${keyAttribute}>`)
    for (const [childKey, childValue] of entries) {
      appendXamlNode(lines, childValue, childKey, depth + 1)
    }
    lines.push(`${indent}</ResourceDictionary>`)
    return
  }

  const element = xamlScalarElement(value)
  lines.push(`${indent}<${element}${keyAttribute}>${escapeXml(String(value))}</${element}>`)
}

function xamlScalarElement(value: unknown): string {
  if (typeof value === 'boolean') return 'x:Boolean'
  if (typeof value === 'number') return Number.isInteger(value) ? 'x:Int32' : 'x:Double'
  return 'x:String'
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

async function parseXamlDocument(text: string, diagnostics: string[]): Promise<unknown> {
  const { XMLParser } = await import('fast-xml-parser')
  diagnostics.push('XAML parser lazy-loaded in worker.')

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    preserveOrder: true,
    parseTagValue: false,
    parseAttributeValue: false,
    // Keep padding: trimming would silently rewrite a string on round-trip.
    trimValues: false,
  })

  const nodes = parser.parse(text) as OrderedNode[]
  const root = nodes.find((node) => tagOf(node) === 'ResourceDictionary')

  if (!root) {
    diagnostics.push('No ResourceDictionary root found; XAML read as a generic XML tree.')
    return parseXmlDocument(text, diagnostics)
  }

  const children = childrenOf(root)
  const rootEntry = children.find((child) => attributesOf(child)['@_x:Key'] === 'Root')

  if (rootEntry) {
    diagnostics.push('Kata XAML dialect recognized; Root resource extracted.')
    return decodeXamlElement(rootEntry)
  }

  diagnostics.push('ResourceDictionary read as an object of keyed resources.')
  return decodeXamlElement(root)
}

function decodeXamlElement(node: OrderedNode): unknown {
  const tag = tagOf(node)
  const children = childrenOf(node)

  if (tag === 'x:Null') {
    return null
  }

  if (tag === 'x:Array') {
    return children
      .filter((child) => tagOf(child) !== '#text')
      .map((child) => decodeXamlElement(child))
  }

  if (tag === 'ResourceDictionary') {
    const out: Record<string, unknown> = {}
    for (const child of children) {
      const childTag = tagOf(child)
      if (childTag === null || childTag === '#text') {
        continue
      }
      const key = attributesOf(child)['@_x:Key']
      if (key === undefined || key === 'SourceName') {
        continue
      }
      out[key] = decodeXamlElement(child)
    }
    return out
  }

  const text = children
    .filter((child) => tagOf(child) === '#text')
    .map((child) => String(child['#text'] ?? ''))
    .join('')

  switch (tag) {
    case 'x:Boolean':
      return text === 'true'
    case 'x:Int32':
    case 'x:Int64':
    case 'x:Double':
    case 'x:Single':
    case 'x:Decimal':
      return Number(text)
    default:
      return text
  }
}
