import type { ExportFormat, SourceFormat } from './types'

const MARKDOWN_EXTENSIONS = new Set(['md', 'markdown'])
const YAML_EXTENSIONS = new Set(['yaml', 'yml'])
const TEXT_EXTENSIONS = new Set(['txt', 'log', 'text'])

export function inferFormat(sourceName: string, mimeType = ''): SourceFormat {
  const normalized = sourceName.toLowerCase()
  const extension = normalized.includes('.') ? normalized.split('.').pop() ?? '' : ''

  if (normalized.endsWith('.json') || mimeType.includes('json')) {
    return 'json'
  }

  if (MARKDOWN_EXTENSIONS.has(extension) || mimeType.includes('markdown')) {
    return 'markdown'
  }

  if (YAML_EXTENSIONS.has(extension)) {
    return 'yaml'
  }

  if (normalized.endsWith('.toml')) {
    return 'toml'
  }

  if (normalized.endsWith('.ini') || normalized.endsWith('.cfg') || normalized.endsWith('.conf')) {
    return 'ini'
  }

  if (TEXT_EXTENSIONS.has(extension) || mimeType.startsWith('text/')) {
    return 'text'
  }

  return 'text'
}

export function recommendedExportFormat(format: SourceFormat): ExportFormat {
  if (format === 'yaml' || format === 'toml' || format === 'markdown' || format === 'ini') {
    return format
  }

  if (format === 'text') {
    return 'text'
  }

  return 'json'
}

export function exportMime(format: ExportFormat): string {
  switch (format) {
    case 'yaml':
      return 'application/yaml'
    case 'toml':
      return 'application/toml'
    case 'markdown':
      return 'text/markdown;charset=utf-8'
    case 'xaml':
      return 'application/xml;charset=utf-8'
    case 'ini':
      return 'text/plain;charset=utf-8'
    case 'text':
      return 'text/plain;charset=utf-8'
    default:
      return 'application/json;charset=utf-8'
  }
}

export function suggestExportName(sourceName: string, format: ExportFormat): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'kata-export'
  const extensionMap: Record<ExportFormat, string> = {
    json: 'json',
    yaml: 'yaml',
    toml: 'toml',
    markdown: 'md',
    xaml: 'xaml',
    ini: 'ini',
    text: 'txt',
  }

  return `${base}.${extensionMap[format]}`
}

export function isSupportedTextFile(name: string): boolean {
  const format = inferFormat(name)
  return format !== 'text' || /\.(txt|log|text)$/i.test(name)
}

export function formatLabel(format: SourceFormat | ExportFormat): string {
  return format.toUpperCase()
}