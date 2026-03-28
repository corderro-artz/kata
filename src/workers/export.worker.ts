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

function post(message: ExportResponse): void {
  scope.postMessage(message)
}