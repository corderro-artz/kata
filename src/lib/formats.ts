import {
  FORMAT_SPECS,
  PARSEABLE_FORMATS,
  extensionOf,
  getFormatSpec,
} from './registry'
import type { ExportFormat, SourceFormat } from './types'

export {
  FORMAT_SPECS,
  IMPORT_ACCEPT_ATTRIBUTE,
  PARSEABLE_FORMATS,
  SERIALIZABLE_FORMATS,
  getFormatSpec,
  importPickerAccept,
} from './registry'
export type { Fidelity, FormatSpec } from './registry'

export function inferFormat(sourceName: string, mimeType = ''): SourceFormat {
  const extension = extensionOf(sourceName)

  for (const spec of PARSEABLE_FORMATS) {
    if (spec.extensions.includes(extension)) {
      return spec.id
    }
  }

  if (mimeType) {
    const normalizedMime = mimeType.toLowerCase()
    for (const spec of PARSEABLE_FORMATS) {
      if (spec.mimes.some((candidate) => normalizedMime.includes(candidate))) {
        return spec.id
      }
    }
  }

  return 'text'
}

export function recommendedExportFormat(format: SourceFormat): ExportFormat {
  return getFormatSpec(format).canSerialize ? format : 'json'
}

export function exportMime(format: ExportFormat): string {
  return getFormatSpec(format).exportMime
}

export function suggestExportName(sourceName: string, format: ExportFormat): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'kata-export'
  return `${base}.${getFormatSpec(format).exportExtension}`
}

export function isSupportedTextFile(name: string): boolean {
  const extension = extensionOf(name)
  return PARSEABLE_FORMATS.some((spec) => spec.extensions.includes(extension))
}

export function formatLabel(format: SourceFormat | ExportFormat): string {
  return getFormatSpec(format).label
}

export function formatMenuLabel(format: SourceFormat | ExportFormat): string {
  return getFormatSpec(format).menuLabel
}

/** Human-readable list of supported inputs, for the welcome screen. */
export const SUPPORTED_INPUT_SUMMARY = FORMAT_SPECS
  .filter((spec) => spec.canParse && spec.id !== 'text')
  .map((spec) => spec.menuLabel)
  .join(', ')
