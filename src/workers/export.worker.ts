import { stringify as stringifyToml } from 'smol-toml'
import YAML from 'yaml'

import type { ExportRequest, ExportResponse } from '../lib/types'

const scope = self as unknown as Worker

scope.onmessage = (event: MessageEvent<ExportRequest>) => {
  void handleRequest(event.data)
}

async function handleRequest(request: ExportRequest): Promise<void> {
  try {
    const value = prepareValue(request.document.structuredData)
    let text = ''

    switch (request.format) {
      case 'yaml':
        text = YAML.stringify(value)
        break
      case 'toml':
        text = stringifyToml(asTomlRoot(value))
        break
      case 'markdown':
        text = request.document.format === 'markdown'
          ? request.document.text
          : toMarkdown(value, request.document.sourceName)
        break
      case 'ini': {
        const ini = await import('ini')
        text = ini.stringify(asTomlRoot(value))
        break
      }
      case 'text':
        text = request.document.format === 'text'
          ? request.document.text
          : toText(value, request.document.sourceName)
        break
      case 'xaml':
        text = toXaml(value, request.document.sourceName)
        break
      default:
        text = JSON.stringify(value, null, 2)
        break
    }

    post({ type: 'exported', format: request.format, text })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown export error'
    post({ type: 'error', message })
  }
}

function prepareValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return { value: null }
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

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, prepareValue(child)]),
    )
  }

  return value
}

function asTomlRoot(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return { value }
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
        stack.push({
          value: child,
          label: key,
          depth: current.depth + 1,
        })
      }
      continue
    }

    lines.push(`- ${current.label}: ${String(current.value)}`)
    lines.push('')
  }

  return lines.join('\n').trim()
}

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

function appendXamlNode(lines: string[], value: unknown, key: string, depth: number): void {
  const indent = '  '.repeat(depth)
  if (Array.isArray(value)) {
    lines.push(`${indent}<x:Array x:Key="${escapeXml(key)}" Type="x:String">`)
    for (const item of value) {
      lines.push(`${indent}  <x:String>${escapeXml(stringifyScalar(item))}</x:String>`)
    }
    lines.push(`${indent}</x:Array>`)
    return
  }

  if (value !== null && typeof value === 'object') {
    lines.push(`${indent}<ResourceDictionary x:Key="${escapeXml(key)}">`)
    for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
      appendXamlNode(lines, childValue, childKey, depth + 1)
    }
    lines.push(`${indent}</ResourceDictionary>`)
    return
  }

  lines.push(`${indent}<x:String x:Key="${escapeXml(key)}">${escapeXml(stringifyScalar(value))}</x:String>`)
}

function stringifyScalar(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return value
  return String(value)
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function toText(value: unknown, sourceName: string): string {
  const lines: string[] = [`# ${sourceName}`, '']
  flattenText('', value, lines)
  return lines.join('\n')
}

function flattenText(prefix: string, value: unknown, lines: string[]): void {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      flattenText(prefix ? `${prefix}[${index}]` : `[${index}]`, value[index], lines)
    }
    return
  }

  if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      flattenText(prefix ? `${prefix}.${key}` : key, child, lines)
    }
    return
  }

  lines.push(`${prefix} = ${value === null || value === undefined ? 'null' : String(value)}`)
}

function post(message: ExportResponse): void {
  scope.postMessage(message)
}