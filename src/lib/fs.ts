import { inferFormat, isSupportedTextFile } from './formats'
import type { SourceFormat, WorkspaceFileEntry } from './types'

const MAX_WORKSPACE_FILES = 400
const MAX_DEPTH = 5

export async function openManualFile(): Promise<File | null> {
  if (!('showOpenFilePicker' in window)) {
    return null
  }

  const [handle] = await window.showOpenFilePicker({
    excludeAcceptAllOption: false,
    multiple: false,
    types: [
      {
        description: 'Structured text',
        accept: {
          'application/json': ['.json'],
          'text/markdown': ['.md', '.markdown'],
          'application/yaml': ['.yaml', '.yml'],
          'application/toml': ['.toml'],
          'text/plain': ['.ini', '.cfg', '.conf', '.txt', '.log'],
        },
      },
    ],
  })

  return handle.getFile()
}

export async function openWorkspace(): Promise<{
  root: FileSystemDirectoryHandle
  files: WorkspaceFileEntry[]
} | null> {
  if (!('showDirectoryPicker' in window)) {
    return null
  }

  const root = await window.showDirectoryPicker({ mode: 'readwrite' })
  const files: WorkspaceFileEntry[] = []

  await scanDirectory(root, '', files, 0)

  files.sort((left, right) => left.path.localeCompare(right.path))

  return { root, files }
}

export async function readWorkspaceFile(entry: WorkspaceFileEntry): Promise<File> {
  return entry.handle.getFile()
}

export async function saveTextToHandle(handle: FileSystemFileHandle, text: string): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(text)
  await writable.close()
}

export function downloadText(filename: string, text: string, mimeType: string): void {
  const blob = new Blob([text], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function detectSourceFormat(file: File): SourceFormat {
  return inferFormat(file.name, file.type)
}

async function scanDirectory(
  directory: FileSystemDirectoryHandle,
  basePath: string,
  files: WorkspaceFileEntry[],
  depth: number,
): Promise<void> {
  if (depth > MAX_DEPTH || files.length >= MAX_WORKSPACE_FILES) {
    return
  }

  for await (const entry of directory.values()) {
    if (files.length >= MAX_WORKSPACE_FILES) {
      return
    }

    if (entry.kind === 'directory') {
      if (entry.name.startsWith('.')) {
        continue
      }

      const nextBasePath = basePath ? `${basePath}/${entry.name}` : entry.name
      await scanDirectory(entry, nextBasePath, files, depth + 1)
      continue
    }

    if (entry.kind === 'file' && isSupportedTextFile(entry.name)) {
      const path = basePath ? `${basePath}/${entry.name}` : entry.name
      files.push({ path, handle: entry })
    }
  }
}