export type SourceFormat = 'json' | 'markdown' | 'yaml' | 'toml' | 'ini' | 'text'

export type ViewMode = 'tree' | 'raw' | 'diff' | 'graph'

export type ExportFormat = 'json' | 'yaml' | 'toml' | 'markdown'

export type NodeKind = 'object' | 'array' | 'value'

export type ValueKind =
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'date'
  | 'unknown'
  | 'container'

export interface FlatNode {
  id: number
  parentId: number
  depth: number
  kind: NodeKind
  key: string | null
  label: string
  value: string | null
  valueKind: ValueKind
  childStart: number
  childEnd: number
  meta: number
}

export interface DocumentStats {
  nodeCount: number
  leafCount: number
  maxDepth: number
  lineCount: number
  parseMs: number
}

export interface ParsedDocument {
  sourceName: string
  format: SourceFormat
  size: number
  text: string
  previewText: string
  rootId: number
  nodes: FlatNode[]
  childIds: Uint32Array
  stats: DocumentStats
  diagnostics: string[]
  structuredData: unknown | null
}

export interface ParseProgressMessage {
  type: 'progress'
  phase: 'read' | 'parse'
  loaded: number
  total: number
  previewText: string
  sourceName: string
}

export interface ParseCompleteMessage {
  type: 'parsed'
  document: ParsedDocument
}

export interface ParseErrorMessage {
  type: 'error'
  message: string
}

export type ParseResponse =
  | ParseProgressMessage
  | ParseCompleteMessage
  | ParseErrorMessage

export interface ParseFileRequest {
  type: 'parse-file'
  file: File
  sourceName?: string
  formatHint?: SourceFormat
}

export interface ParseTextRequest {
  type: 'parse-text'
  text: string
  sourceName: string
  formatHint?: SourceFormat
}

export type ParseRequest = ParseFileRequest | ParseTextRequest

export interface ExportRequest {
  type: 'export'
  format: ExportFormat
  document: ParsedDocument
}

export interface ExportCompleteMessage {
  type: 'exported'
  format: ExportFormat
  text: string
}

export interface ExportErrorMessage {
  type: 'error'
  message: string
}

export type ExportResponse = ExportCompleteMessage | ExportErrorMessage

export interface WorkspaceFileEntry {
  path: string
  handle: FileSystemFileHandle
}

export interface ThemeDefinition {
  id: ThemeId
  label: string
  scheme: 'light' | 'dark'
  description: string
  tokens: Record<string, string>
}

export type ThemeId =
  | 'vapor-light'
  | 'vapor-dark'
  | 'flat-light'
  | 'flat-dark'
  | 'contrast-light'
  | 'contrast-dark'

export interface VisibleRow {
  nodeId: number
  depth: number
}