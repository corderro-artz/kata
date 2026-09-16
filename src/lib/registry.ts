import type { FormatId } from './types'

/**
 * Round-trip quality of a format's exporter, as measured by
 * `scripts/format-parity.mjs`.
 *
 * - `lossless` — export then re-import returns a deep-equal value.
 * - `lossy`    — some information cannot survive the format. The exporter must
 *                say so in its notes; silent loss is a bug.
 * - `one-way`  — deliberately has no parser. Requires `oneWayReason`.
 */
export type Fidelity = 'lossless' | 'lossy' | 'one-way'

export interface FormatSpec {
  id: FormatId
  /** Short badge text, e.g. in the document header. */
  label: string
  /** Longer name for the export menu. */
  menuLabel: string
  /** Lowercase extensions, without the leading dot. */
  extensions: string[]
  /** Lowercase MIME substrings used as a fallback when the name is unhelpful. */
  mimes: string[]
  /** Extension used when naming a downloaded file. */
  exportExtension: string
  exportMime: string
  canParse: boolean
  canSerialize: boolean
  fidelity: Fidelity
  /** Shown next to the export selector when fidelity is not `lossless`. */
  lossNotes?: string
  oneWayReason?: string
}

/**
 * Order matters. `inferFormat` walks this list top-down, so a format whose MIME
 * substring is contained in another's must come first — `text` is always last.
 */
export const FORMAT_SPECS: readonly FormatSpec[] = [
  {
    id: 'json',
    label: 'JSON',
    menuLabel: 'JSON',
    extensions: ['json'],
    mimes: ['json'],
    exportExtension: 'json',
    exportMime: 'application/json;charset=utf-8',
    canParse: true,
    canSerialize: true,
    fidelity: 'lossless',
  },
  {
    id: 'jsonc',
    label: 'JSONC',
    menuLabel: 'JSON with comments',
    extensions: ['jsonc', 'json5'],
    mimes: [],
    exportExtension: 'json',
    exportMime: 'application/json;charset=utf-8',
    canParse: true,
    // Comments are not retained in the flat model, so writing them back would
    // be a fabrication. Export as plain JSON instead.
    canSerialize: false,
    fidelity: 'lossless',
  },
  {
    id: 'yaml',
    label: 'YAML',
    menuLabel: 'YAML',
    extensions: ['yaml', 'yml'],
    mimes: ['yaml'],
    exportExtension: 'yaml',
    exportMime: 'application/yaml',
    canParse: true,
    canSerialize: true,
    fidelity: 'lossless',
  },
  {
    id: 'toml',
    label: 'TOML',
    menuLabel: 'TOML',
    extensions: ['toml'],
    mimes: ['toml'],
    exportExtension: 'toml',
    exportMime: 'application/toml',
    canParse: true,
    canSerialize: true,
    fidelity: 'lossy',
    lossNotes: 'TOML has no null. Null-valued keys are dropped and listed below.',
  },
  {
    id: 'ini',
    label: 'INI',
    menuLabel: 'INI',
    extensions: ['ini', 'cfg', 'conf'],
    mimes: [],
    exportExtension: 'ini',
    exportMime: 'text/plain;charset=utf-8',
    canParse: true,
    canSerialize: true,
    fidelity: 'lossy',
    lossNotes: 'INI stores every value as text. Numbers and booleans are recovered on import only when they round-trip exactly.',
  },
  {
    id: 'markdown',
    label: 'MARKDOWN',
    menuLabel: 'Markdown',
    extensions: ['md', 'markdown'],
    mimes: ['markdown'],
    exportExtension: 'md',
    exportMime: 'text/markdown;charset=utf-8',
    canParse: true,
    canSerialize: true,
    fidelity: 'lossy',
    lossNotes: 'Front matter and tables round-trip as data. Prose is kept verbatim but is not modelled.',
  },
  {
    id: 'xml',
    label: 'XML',
    menuLabel: 'XML',
    extensions: ['xml'],
    mimes: ['xml'],
    exportExtension: 'xml',
    exportMime: 'application/xml;charset=utf-8',
    canParse: true,
    canSerialize: true,
    fidelity: 'lossless',
    lossNotes: 'Kata encodes types with kata:* attributes so its own XML round-trips exactly. Reading XML from other tools maps attributes onto "@_" keys and drops comments.',
  },
  {
    id: 'xaml',
    label: 'XAML',
    menuLabel: 'XAML',
    extensions: ['xaml'],
    mimes: [],
    exportExtension: 'xaml',
    exportMime: 'application/xml;charset=utf-8',
    canParse: true,
    canSerialize: true,
    fidelity: 'lossless',
    lossNotes: "Typed resources (x:Int32, x:Boolean, x:Null, x:Array) make Kata's own XAML round-trip exactly. Markup extensions and bindings from other tools are not modelled.",
  },
  {
    id: 'csv',
    label: 'CSV',
    menuLabel: 'CSV',
    extensions: ['csv'],
    mimes: ['csv'],
    exportExtension: 'csv',
    exportMime: 'text/csv;charset=utf-8',
    canParse: true,
    canSerialize: true,
    fidelity: 'lossy',
    lossNotes: 'CSV is a table. Only an array of flat records can be written; nested values are JSON-encoded into their cell.',
  },
  {
    id: 'tsv',
    label: 'TSV',
    menuLabel: 'TSV',
    extensions: ['tsv', 'tab'],
    mimes: ['tab-separated'],
    exportExtension: 'tsv',
    exportMime: 'text/tab-separated-values;charset=utf-8',
    canParse: true,
    canSerialize: true,
    fidelity: 'lossy',
    lossNotes: 'TSV is a table. Only an array of flat records can be written; nested values are JSON-encoded into their cell.',
  },
  {
    id: 'text',
    label: 'TEXT',
    menuLabel: 'Text',
    extensions: ['txt', 'log', 'text'],
    mimes: ['text/'],
    exportExtension: 'txt',
    exportMime: 'text/plain;charset=utf-8',
    canParse: true,
    canSerialize: true,
    fidelity: 'lossy',
    lossNotes: "Kata's own dotted-path export is read back into structure, but values are untyped: a string that looks like a number returns as a number. Arbitrary prose is sampled, not modelled.",
  },
]

const BY_ID = new Map<FormatId, FormatSpec>(FORMAT_SPECS.map((spec) => [spec.id, spec]))

export function getFormatSpec(id: FormatId): FormatSpec {
  const spec = BY_ID.get(id)
  if (!spec) {
    throw new Error(`Unknown format: ${id}`)
  }
  return spec
}

export const PARSEABLE_FORMATS: readonly FormatSpec[] = FORMAT_SPECS.filter((spec) => spec.canParse)

export const SERIALIZABLE_FORMATS: readonly FormatSpec[] = FORMAT_SPECS.filter((spec) => spec.canSerialize)

export function extensionOf(sourceName: string): string {
  const normalized = sourceName.toLowerCase()
  return normalized.includes('.') ? normalized.split('.').pop() ?? '' : ''
}

/**
 * Comma-separated extension list for an `<input type="file">` accept attribute.
 */
export const IMPORT_ACCEPT_ATTRIBUTE = PARSEABLE_FORMATS
  .flatMap((spec) => spec.extensions.map((extension) => `.${extension}`))
  .join(',')

/**
 * `accept` map for `showOpenFilePicker`, keyed by MIME type. Formats that share
 * a MIME type are merged so the picker shows one entry per type.
 */
type MimeType = `${string}/${string}`
type DottedExtension = `.${string}`

export function importPickerAccept(): Record<MimeType, DottedExtension[]> {
  const accept: Record<MimeType, DottedExtension[]> = {}

  for (const spec of PARSEABLE_FORMATS) {
    const mime = spec.exportMime.split(';')[0] as MimeType
    const extensions = spec.extensions.map((extension): DottedExtension => `.${extension}`)
    accept[mime] = [...new Set([...(accept[mime] ?? []), ...extensions])]
  }

  return accept
}
