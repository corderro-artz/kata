import { signal } from '@preact/signals'
import { memo } from 'preact/compat'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'preact/hooks'

import './app.css'

import {
  detectSourceFormat,
  downloadText,
  openManualFile,
  openWorkspace,
  readWorkspaceFile,
  saveTextToHandle,
} from './lib/fs'
import { exportMime, formatLabel, recommendedExportFormat, suggestExportName } from './lib/formats'
import {
  beginTreeToggle,
  beginViewSwitch,
  flushTreeToggle,
  flushViewSwitch,
  markInitialReady,
  recordParsedDocument,
} from './lib/perf'
import { applyTheme, loadPreferredTheme, themes } from './lib/theme'
import type {
  ExportFormat,
  ExportResponse,
  FlatNode,
  ParsedDocument,
  ParseResponse,
  ThemeId,
  ViewMode,
  VisibleRow,
  WorkspaceFileEntry,
} from './lib/types'
import { useVirtualWindow } from './lib/virtualize'
import { buildNodeIndex, searchNodes, detectReferences, type NodeIndex, type SearchHit, type ReferenceEdge } from './lib/index'
import { scheduleIdleTask } from './lib/scheduler'
import { diffDocuments, type DiffEntry } from './lib/diff'
import { canParseInline, parseInline } from './lib/parse-inline'

const themeSignal = signal<ThemeId>('vapor-dark')
const viewSignal = signal<ViewMode>('tree')

const FALLBACK_SAMPLE_DOCUMENT = `{
  "kata": {
    "name": "Kata",
    "version": "0.1.0-alpha",
    "description": "Local-first structured text parser and visualizer",
    "copyright": "Copyright © 2026 Corderro Artz / Vaporsoft",
    "license": "MIT"
  },
  "performance": {
    "budgets": {
      "firstRenderMs": { "target": 100 },
      "viewSwitchMs": { "target": 50 },
      "expandCollapseMs": { "target": 16 },
      "longTasks": { "target": 0 }
    }
  },
  "stack": {
    "framework": "Preact 10",
    "bundler": "Vite 7",
    "language": "TypeScript 5.9",
    "workers": ["parse", "export"],
    "views": ["tree", "raw", "cards"],
    "themes": 6
  }
}`

export function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const parseWorkerRef = useRef<Worker | null>(null)
  const exportWorkerRef = useRef<Worker | null>(null)
  const initialReadyRef = useRef(false)

  const activeTheme = themeSignal.value
  const activeView = viewSignal.value

  const [documentState, setDocumentState] = useState<ParsedDocument | null>(null)
  const [parseProgress, setParseProgress] = useState<ParseResponse | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([0]))
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFileEntry[]>([])
  const [currentWorkspaceFile, setCurrentWorkspaceFile] = useState<WorkspaceFileEntry | null>(null)
  const [status, setStatus] = useState('Ready')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json')
  const [exportText, setExportText] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: number } | null>(null)
  const [nodeIndex, setNodeIndex] = useState<NodeIndex | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHits, setSearchHits] = useState<SearchHit[]>([])
  const [references, setReferences] = useState<ReferenceEdge[]>([])
  const [diffBase, setDiffBase] = useState<ParsedDocument | null>(null)
  const [diffEntries, setDiffEntries] = useState<DiffEntry[]>([])
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    themeSignal.value = loadPreferredTheme()
  }, [])

  useEffect(() => {
    applyTheme(activeTheme)
  }, [activeTheme])

  function getOrCreateParseWorker(): Worker {
    if (!parseWorkerRef.current) {
      const w = new Worker(new URL('./workers/parse.worker.ts', import.meta.url), { type: 'module' })
      w.onmessage = handleParseMessage
      parseWorkerRef.current = w
    }
    return parseWorkerRef.current
  }

  function getOrCreateExportWorker(): Worker {
    if (!exportWorkerRef.current) {
      const w = new Worker(new URL('./workers/export.worker.ts', import.meta.url), { type: 'module' })
      w.onmessage = handleExportMessage
      exportWorkerRef.current = w
    }
    return exportWorkerRef.current
  }

  function handleParseMessage(event: MessageEvent<ParseResponse>) {
      if (event.data.type === 'progress') {
        setParseProgress(event.data)
        setStatus(
          event.data.phase === 'read'
            ? `Reading ${event.data.sourceName}`
            : `Parsing ${event.data.sourceName}`,
        )
        return
      }

      if (event.data.type === 'parsed') {
        recordParsedDocument(event.data.document.stats)
        setDocumentState(event.data.document)
        setExpandedNodes(seedExpandedNodes(event.data.document))
        setExportFormat(recommendedExportFormat(event.data.document.format))
        setStatus(`Loaded ${event.data.document.sourceName}`)
        setErrorMessage(null)
        setParseProgress(null)
        return
      }

      setErrorMessage(event.data.message)
      setStatus('Parse failed')
      setParseProgress(null)
    }

  function handleExportMessage(event: MessageEvent<ExportResponse>) {
      if (event.data.type === 'exported') {
        setExportText(event.data.text)
        return
      }

      setErrorMessage(event.data.message)
  }

  useEffect(() => {
    scheduleIdleTask(() => {
      getOrCreateParseWorker()
      getOrCreateExportWorker()
    })

    return () => {
      parseWorkerRef.current?.terminate()
      exportWorkerRef.current?.terminate()
    }
  }, [])

  useEffect(() => {
    if (!documentState) {
      return
    }

    getOrCreateExportWorker().postMessage({
      type: 'export',
      format: exportFormat,
      document: documentState,
    })
  }, [documentState, exportFormat])

  useLayoutEffect(() => {
    flushViewSwitch(activeView)
  }, [activeView])

  useLayoutEffect(() => {
    flushTreeToggle()
  }, [expandedNodes])

  useEffect(() => {
    if (!documentState) {
      setNodeIndex(null)
      setSearchHits([])
      setSearchQuery('')
      setReferences([])
      return
    }
    scheduleIdleTask(() => {
      const idx = buildNodeIndex(documentState)
      setNodeIndex(idx)
      scheduleIdleTask(() => {
        setReferences(detectReferences(documentState, idx))
      })
    })
  }, [documentState])

  useEffect(() => {
    if (!diffBase || !documentState) {
      setDiffEntries([])
      return
    }
    scheduleIdleTask(() => {
      setDiffEntries(diffDocuments(diffBase, documentState))
    })
  }, [diffBase, documentState])

  useEffect(() => {
    if (!documentState || !nodeIndex || !searchQuery.trim()) {
      setSearchHits([])
      return
    }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      const hits = searchNodes(documentState, nodeIndex, searchQuery.trim())
      setSearchHits(hits)
      setStatus(hits.length > 0 ? `${hits.length} result${hits.length === 1 ? '' : 's'}` : 'No results')
    }, 180)
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [searchQuery, nodeIndex, documentState])

  useLayoutEffect(() => {
    if (!documentState || initialReadyRef.current) {
      return
    }

    initialReadyRef.current = true
    markInitialReady()
  }, [documentState])


  const matchedNodeIds = useMemo(
    () => new Set(searchHits.map((h) => h.nodeId)),
    [searchHits],
  )

  const linkedNodeIds = useMemo(() => {
    const ids = new Set<number>()
    for (const edge of references) {
      ids.add(edge.sourceId)
      ids.add(edge.targetId)
    }
    return ids
  }, [references])

  useEffect(() => {
    if (searchHits.length === 0 || !nodeIndex || !documentState) return
    const toExpand = new Set(expandedNodes)
    let changed = false
    for (const hit of searchHits) {
      let current = hit.nodeId
      while (current !== documentState.rootId) {
        const parent = nodeIndex.parentMap[current]
        if (!toExpand.has(parent)) {
          toExpand.add(parent)
          changed = true
        }
        current = parent
      }
    }
    if (changed) setExpandedNodes(toExpand)
  }, [searchHits])

  const currentFileLabel = currentWorkspaceFile?.path ?? documentState?.sourceName ?? 'Untitled'
  const previewText = parseProgress?.type === 'progress' ? parseProgress.previewText : documentState?.previewText ?? ''

  async function loadFile(file: File, workspaceEntry?: WorkspaceFileEntry) {
    setStatus(`Queued ${file.name}`)
    setErrorMessage(null)
    setParseProgress(null)
    setCurrentWorkspaceFile(workspaceEntry ?? null)

    getOrCreateParseWorker().postMessage({
      type: 'parse-file',
      file,
      sourceName: workspaceEntry?.path ?? file.name,
      formatHint: detectSourceFormat(file),
    })
  }

  async function handleLoadSample() {
    setStatus('Loading sample…')

    const cached = getCachedSample()
    const sample = cached ?? await loadDefaultSampleDocument()

    if (canParseInline(sample.text, 'json')) {
      try {
        const doc = parseInline(sample.text, sample.sourceName)
        recordParsedDocument(doc.stats)
        setDocumentState(doc)
        setExpandedNodes(seedExpandedNodes(doc))
        setExportFormat(recommendedExportFormat(doc.format))
        setStatus(`Loaded ${doc.sourceName}`)
        setErrorMessage(null)
        return
      } catch { /* fall through to worker */ }
    }

    getOrCreateParseWorker().postMessage({
      type: 'parse-text',
      text: sample.text,
      sourceName: sample.sourceName,
      formatHint: 'json',
    })
  }

  async function handleManualOpen() {
    try {
      const file = await openManualFile()
      if (file) {
        await loadFile(file)
        return
      }

      fileInputRef.current?.click()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to open file.')
    }
  }

  async function handleWorkspaceOpen() {
    try {
      const workspace = await openWorkspace()
      if (!workspace) {
        setErrorMessage('Workspace mode is not available in this browser.')
        return
      }

      setWorkspaceFiles(workspace.files)
      setStatus(`Indexed ${workspace.files.length} workspace files`)
      if (workspace.files[0]) {
        const file = await readWorkspaceFile(workspace.files[0])
        await loadFile(file, workspace.files[0])
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to open workspace.')
    }
  }

  async function handleWorkspaceSelect(entry: WorkspaceFileEntry) {
    const file = await readWorkspaceFile(entry)
    await loadFile(file, entry)
  }

  async function handleCopyExport() {
    if (!exportText) {
      return
    }

    try {
      await navigator.clipboard.writeText(exportText)
      setStatus('Export copied to clipboard')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Clipboard write failed.')
    }
  }

  async function handleSaveExport() {
    if (!exportText || !currentWorkspaceFile) {
      return
    }

    try {
      await saveTextToHandle(currentWorkspaceFile.handle, exportText)
      setStatus(`Saved ${currentWorkspaceFile.path}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save export.')
    }
  }

  const toggleNode = useCallback((nodeId: number) => {
    beginTreeToggle()
    setExpandedNodes((current) => {
      const next = new Set(current)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  function handleExpandAll() {
    if (!documentState) return
    beginTreeToggle()
    const all = new Set<number>()
    for (const node of documentState.nodes) {
      if (node.childEnd > node.childStart) all.add(node.id)
    }
    setExpandedNodes(all)
    setContextMenu(null)
  }

  function handleCollapseAll() {
    if (!documentState) return
    beginTreeToggle()
    setExpandedNodes(new Set([documentState.rootId]))
    setContextMenu(null)
  }

  async function handleCopyValue(nodeId?: number) {
    if (!documentState) return
    const id = nodeId ?? documentState.rootId
    const node = documentState.nodes[id]
    const text = node?.value ?? node?.label ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setStatus(`Copied value: ${text.length > 60 ? text.slice(0, 60) + '…' : text}`)
    } catch {
      setErrorMessage('Clipboard write failed.')
    }
    setContextMenu(null)
  }

  async function handleCopyPath(nodeId?: number) {
    if (!documentState) return
    const id = nodeId ?? documentState.rootId
    const path = buildNodePath(documentState, id)
    try {
      await navigator.clipboard.writeText(path)
      setStatus(`Copied path: ${path}`)
    } catch {
      setErrorMessage('Clipboard write failed.')
    }
    setContextMenu(null)
  }

  const handleContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault()
    const target = event.target as HTMLElement
    const row = target.closest('.tree-row')
    const toggle = row?.querySelector('[data-kata-node-id]') as HTMLElement | null
    const nodeId = toggle ? Number(toggle.dataset.kataNodeId) : undefined
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId })
  }, [])

  useEffect(() => {
    if (!contextMenu) return
    const dismiss = () => setContextMenu(null)
    window.addEventListener('click', dismiss)
    window.addEventListener('contextmenu', dismiss)
    return () => {
      window.removeEventListener('click', dismiss)
      window.removeEventListener('contextmenu', dismiss)
    }
  }, [contextMenu])

  return (
    <div class="app-shell">
      <header class="toolbar">
        <div class="toolbar__brand">
          <img src={themes.find((t) => t.id === activeTheme)?.scheme === 'light' ? '/kata-favicon-light.svg' : '/kata-favicon.svg'} alt="" width="24" height="24" class="toolbar__logo" />
          <span class="toolbar__title">Kata</span>
        </div>

        <div class="toolbar__actions">
          <button type="button" class="toolbar-btn" onClick={() => void handleManualOpen()}>
            Open file
          </button>
          <button type="button" class="toolbar-btn toolbar-btn--ghost" onClick={() => void handleWorkspaceOpen()}>
            Open folder
          </button>

          <span class="toolbar__divider" />

          <select
            class="toolbar-select"
            aria-label="Theme"
            value={activeTheme}
            onChange={(event) => {
              themeSignal.value = event.currentTarget.value as ThemeId
            }}
          >
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>{theme.label}</option>
            ))}
          </select>
        </div>

        <div class="toolbar__status">
          <span class="toolbar__status-text">{status}</span>
        </div>
      </header>

      <main class="workspace">
        <aside
          class={`sidebar ${workspaceFiles.length === 0 && !documentState ? 'sidebar--collapsed' : ''}`}
        >
          {workspaceFiles.length > 0 ? (
            <div class="file-list">
              <div class="file-list__header">
                <span class="label-sm">Files</span>
                <span class="label-sm label-sm--muted">{workspaceFiles.length}</span>
              </div>
              {workspaceFiles.map((entry) => (
                <button
                  key={entry.path}
                  type="button"
                  class={`file-item ${currentWorkspaceFile?.path === entry.path ? 'is-active' : ''}`}
                  onClick={() => void handleWorkspaceSelect(entry)}
                >
                  <span class="file-item__name">{entry.path}</span>
                  <span class="file-item__type">{formatLabel(documentState?.sourceName === entry.path ? documentState.format : 'text')}</span>
                </button>
              ))}
            </div>
          ) : null}

          {documentState ? (
            <div class="info-panel">
              <div class="info-panel__header">
                <span class="label-sm">Document</span>
              </div>
              <div class="info-grid">
                <div class="info-grid__item">
                  <span class="info-grid__label">Format</span>
                  <span class="info-grid__value">{formatLabel(documentState.format)}</span>
                </div>
                <div class="info-grid__item">
                  <span class="info-grid__label">Size</span>
                  <span class="info-grid__value">{byteLabel(documentState.size)}</span>
                </div>
                <div class="info-grid__item">
                  <span class="info-grid__label">Nodes</span>
                  <span class="info-grid__value">{documentState.stats.nodeCount}</span>
                </div>
                <div class="info-grid__item">
                  <span class="info-grid__label">Depth</span>
                  <span class="info-grid__value">{documentState.stats.maxDepth}</span>
                </div>
                <div class="info-grid__item">
                  <span class="info-grid__label">Lines</span>
                  <span class="info-grid__value">{documentState.stats.lineCount}</span>
                </div>
                <div class="info-grid__item">
                  <span class="info-grid__label">Parsed</span>
                  <span class="info-grid__value">{documentState.stats.parseMs} ms</span>
                </div>
                {references.length > 0 ? (
                  <div class="info-grid__item">
                    <span class="info-grid__label">Refs</span>
                    <span class="info-grid__value">{references.length}</span>
                  </div>
                ) : null}
              </div>

              {documentState.diagnostics.length > 0 ? (
                <div class="diagnostics">
                  <span class="label-sm">Diagnostics</span>
                  <ul class="diagnostics__list">
                    {documentState.diagnostics.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          <div class="export-panel">
            <div class="export-panel__header">
              <span class="label-sm">Export</span>
            </div>
            <label class="export-panel__format">
              <select
                aria-label="Export format"
                value={exportFormat}
                onChange={(event) => {
                  setExportFormat(event.currentTarget.value as ExportFormat)
                }}
              >
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
                <option value="toml">TOML</option>
                <option value="markdown">Markdown</option>
              </select>
            </label>
            <div class="export-panel__actions">
              <button
                type="button"
                class="toolbar-btn toolbar-btn--sm"
                onClick={() => {
                  if (!documentState) { return }
                  downloadText(suggestExportName(documentState.sourceName, exportFormat), exportText, exportMime(exportFormat))
                }}
                disabled={!documentState || !exportText}
              >
                Download
              </button>
              <button
                type="button"
                class="toolbar-btn toolbar-btn--sm toolbar-btn--ghost"
                onClick={() => void handleCopyExport()}
                disabled={!exportText}
              >
                Copy
              </button>
              {currentWorkspaceFile ? (
                <button
                  type="button"
                  class="toolbar-btn toolbar-btn--sm toolbar-btn--ghost"
                  onClick={() => void handleSaveExport()}
                  disabled={!exportText}
                >
                  Save
                </button>
              ) : null}
            </div>
          </div>
        </aside>

        <section class="editor-area">
          <div class="editor-area__chrome">
            {documentState ? (
              <div class="tab-strip">
                {(['tree', 'raw', 'cards'] as ViewMode[]).map((view) => (
                  <button
                    key={view}
                    type="button"
                    class={`tab ${activeView === view ? 'is-active' : ''}`}
                    data-kata-view={view}
                    onClick={() => {
                      if (activeView !== view) { beginViewSwitch() }
                      viewSignal.value = view
                    }}
                  >
                    {view === 'cards' ? 'Cards' : view[0].toUpperCase() + view.slice(1)}
                  </button>
                ))}
                {diffBase ? (
                  <button
                    type="button"
                    class={`tab ${activeView === 'diff' ? 'is-active' : ''}`}
                    onClick={() => {
                      if (activeView !== 'diff') { beginViewSwitch() }
                      viewSignal.value = 'diff'
                    }}
                  >
                    Diff
                  </button>
                ) : null}
              </div>
            ) : null}

            {documentState ? (
              <div class="search-bar">
                <input
                  type="text"
                  class="search-bar__input"
                  placeholder="Search nodes…"
                  value={searchQuery}
                  onInput={(event) => setSearchQuery(event.currentTarget.value)}
                />
                {searchHits.length > 0 ? (
                  <span class="search-bar__count">{searchHits.length}</span>
                ) : null}
              </div>
            ) : null}

            <div class="editor-area__file-label">
              <span>{currentFileLabel}</span>
              {documentState ? <span class="badge">{formatLabel(documentState.format)}</span> : null}
            </div>
          </div>

          {errorMessage ? <div class="error-banner">{errorMessage}</div> : null}

          <div
            class={`viewer ${dragActive ? 'viewer--drag' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragActive(true) }}
            onDragLeave={() => { setDragActive(false) }}
            onDrop={(event) => {
              event.preventDefault()
              setDragActive(false)
              const file = event.dataTransfer?.files?.[0]
              if (file) { void loadFile(file) }
            }}
            onContextMenu={handleContextMenu}
          >
            {!documentState && !parseProgress ? (
              <div class="welcome">
                <img
                  src={themes.find((t) => t.id === activeTheme)?.scheme === 'light' ? '/kata-icon-light.svg' : '/kata-icon.svg'}
                  alt="Kata"
                  width="240"
                  height="240"
                  class="welcome__logo"
                  fetchpriority="high"
                />
                <p class="welcome__hint">Drop a file here, or use <strong>Open file</strong> to get started.</p>
                <p class="welcome__formats">Supports JSON, YAML, TOML, and Markdown.</p>
                <button type="button" class="welcome__sample" onClick={() => void handleLoadSample()}>Load sample file</button>
                <p class="welcome__copy">&copy; 2026 Vaporsoft</p>
              </div>
            ) : null}

            {activeView === 'tree' && documentState ? (
              <TreeView documentState={documentState} expandedNodes={expandedNodes} onToggle={toggleNode} matchedNodeIds={matchedNodeIds} linkedNodeIds={linkedNodeIds} />
            ) : null}

            {activeView === 'raw' ? <RawView text={previewText || exportText} format={documentState?.format} /> : null}

            {activeView === 'cards' && documentState ? (
              <CardView documentState={documentState} expandedNodes={expandedNodes} onToggle={toggleNode} matchedNodeIds={matchedNodeIds} />
            ) : null}

            {activeView === 'diff' && diffEntries.length > 0 ? (
              <DiffView entries={diffEntries} />
            ) : null}

            {activeView === 'diff' && diffEntries.length === 0 && diffBase ? (
              <div class="viewer__empty">
                <span>No differences found</span>
              </div>
            ) : null}

            {contextMenu ? (
              <div
                class="context-menu"
                style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
              >
                <button type="button" class="context-menu__item" onClick={handleExpandAll}>
                  Expand all
                </button>
                <button type="button" class="context-menu__item" onClick={handleCollapseAll}>
                  Collapse all
                </button>
                <div class="context-menu__divider" />
                <button type="button" class="context-menu__item" onClick={() => void handleCopyValue(contextMenu.nodeId)}>
                  Copy value
                </button>
                <button type="button" class="context-menu__item" onClick={() => void handleCopyPath(contextMenu.nodeId)}>
                  Copy path
                </button>
                <div class="context-menu__divider" />
                <button type="button" class="context-menu__item" onClick={() => { setDiffBase(documentState); setStatus('Diff base set'); setContextMenu(null) }}>
                  Set as diff base
                </button>
                {diffBase ? (
                  <button type="button" class="context-menu__item" onClick={() => { setDiffBase(null); setDiffEntries([]); setStatus('Diff cleared'); setContextMenu(null) }}>
                    Clear diff base
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".json,.md,.markdown,.yaml,.yml,.toml,.ini,.cfg,.conf,.txt,.log"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          if (file) { void loadFile(file) }
          event.currentTarget.value = ''
        }}
      />
    </div>
  )
}

let samplePromise: Promise<{ text: string; sourceName: string }> | null = null
let sampleCache: { text: string; sourceName: string } | null = null

// Start preloading immediately at module evaluation
loadDefaultSampleDocument()

function loadDefaultSampleDocument(): Promise<{ text: string; sourceName: string }> {
  if (!samplePromise) {
    samplePromise = fetchSampleDocument().then(result => {
      sampleCache = result
      return result
    })
  }
  return samplePromise
}

function getCachedSample(): { text: string; sourceName: string } | null {
  return sampleCache
}

async function fetchSampleDocument(): Promise<{ text: string; sourceName: string }> {
  try {
    const response = await fetch('/samples/latest-profile.json')

    if (!response.ok) {
      throw new Error(`Sample fetch failed with status ${response.status}`)
    }

    const text = await response.text()
    if (!text.trim()) {
      throw new Error('Sample fetch returned empty content')
    }

    return {
      text,
      sourceName: 'latest-performance-report.json',
    }
  } catch {
    return {
      text: FALLBACK_SAMPLE_DOCUMENT,
      sourceName: 'kata-sample.json',
    }
  }
}

const TreeRow = memo(function TreeRow({
  node,
  depth,
  isExpanded,
  isMatch,
  isLinked,
  onToggle,
}: {
  node: FlatNode
  depth: number
  isExpanded: boolean
  isMatch: boolean
  isLinked: boolean
  onToggle: (nodeId: number) => void
}) {
  const childCount = node.childEnd - node.childStart

  return (
    <div class={`tree-row ${isMatch ? 'tree-row--match' : ''}`} style={{ paddingInlineStart: `${depth * 18 + 18}px` }}>
      <button
        type="button"
        class={`tree-toggle ${childCount === 0 ? 'is-empty' : ''}`}
        data-kata-tree-toggle="true"
        data-kata-node-id={String(node.id)}
        data-kata-empty={childCount === 0 ? 'true' : 'false'}
        onClick={() => {
          if (childCount > 0) {
            onToggle(node.id)
          }
        }}
      >
        {childCount > 0 ? (isExpanded ? '−' : '+') : '·'}
      </button>
      <span class="tree-key">{node.label}</span>
      <span class={`tree-kind tree-kind--${node.kind}`}>{node.kind}</span>
      {isLinked ? <span class="tree-ref-badge">ref</span> : null}
      <span class="tree-value">{node.value}</span>
    </div>
  )
})

function TreeView({
  documentState,
  expandedNodes,
  onToggle,
  matchedNodeIds,
  linkedNodeIds,
}: {
  documentState: ParsedDocument
  expandedNodes: Set<number>
  onToggle: (nodeId: number) => void
  matchedNodeIds: Set<number>
  linkedNodeIds: Set<number>
}) {
  const rows = useMemo(
    () => buildVisibleRows(documentState, expandedNodes),
    [documentState, expandedNodes],
  )
  const virtual = useVirtualWindow(rows.length, 34)
  const windowRows = rows.slice(virtual.start, virtual.end)

  return (
    <div ref={virtual.containerRef} class="viewport" onScroll={virtual.onScroll}>
      <div style={{ height: `${virtual.totalHeight}px` }}>
        <div style={{ transform: `translateY(${virtual.offsetTop}px)` }}>
          {windowRows.map((row) => (
            <TreeRow
              key={documentState.nodes[row.nodeId].id}
              node={documentState.nodes[row.nodeId]}
              depth={row.depth}
              isExpanded={expandedNodes.has(row.nodeId)}
              isMatch={matchedNodeIds.has(row.nodeId)}
              isLinked={linkedNodeIds.has(row.nodeId)}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function RawView({ text, format }: { text: string; format?: ParsedDocument['format'] }) {
  const lines = useMemo(() => text.split(/\r?\n/), [text])
  const virtual = useVirtualWindow(lines.length, 24)
  const windowLines = lines.slice(virtual.start, virtual.end)

  return (
    <div ref={virtual.containerRef} class="viewport viewport--raw" onScroll={virtual.onScroll}>
      <div style={{ height: `${virtual.totalHeight}px` }}>
        <div style={{ transform: `translateY(${virtual.offsetTop}px)` }}>
          {windowLines.map((line, index) => {
            const lineNumber = virtual.start + index + 1
            return (
              <div key={`${lineNumber}:${line}`} class="raw-row">
                <span class="raw-row__number">{lineNumber}</span>
                <span
                  class="raw-row__content"
                  dangerouslySetInnerHTML={{ __html: highlightLine(line, format) }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CardView({
  documentState,
  expandedNodes,
  onToggle,
  matchedNodeIds,
}: {
  documentState: ParsedDocument
  expandedNodes: Set<number>
  onToggle: (nodeId: number) => void
  matchedNodeIds: Set<number>
}) {
  const rows = useMemo(
    () => buildVisibleRows(documentState, expandedNodes),
    [documentState, expandedNodes],
  )
  const virtual = useVirtualWindow(rows.length, 42)
  const windowRows = rows.slice(virtual.start, virtual.end)

  return (
    <div ref={virtual.containerRef} class="viewport viewport--cards" onScroll={virtual.onScroll}>
      <div style={{ height: `${virtual.totalHeight}px` }}>
        <div style={{ transform: `translateY(${virtual.offsetTop}px)` }}>
          {windowRows.map((row) => {
            const node = documentState.nodes[row.nodeId]
            const childCount = node.childEnd - node.childStart
            const isExpanded = expandedNodes.has(node.id)

            return (
              <div
                key={node.id}
                class={`card-row ${childCount > 0 ? 'card-row--parent' : ''} ${matchedNodeIds.has(node.id) ? 'card-row--match' : ''}`}
                style={{ paddingInlineStart: `${row.depth * 20 + 12}px` }}
              >
                <button
                  type="button"
                  class={`card-toggle ${childCount === 0 ? 'is-empty' : ''}`}
                  onClick={() => { if (childCount > 0) { onToggle(node.id) } }}
                >
                  {childCount > 0 ? (isExpanded ? '−' : '+') : '·'}
                </button>
                <span class="card-row__label">{node.label}</span>
                <span class={`tree-kind tree-kind--${node.kind}`}>{node.kind}</span>
                {childCount > 0 ? (
                  <span class="card-row__count">{node.value}</span>
                ) : (
                  <span class="card-row__value">{node.value}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DiffView({ entries }: { entries: DiffEntry[] }) {
  const filtered = useMemo(
    () => entries.filter((e) => e.kind !== 'unchanged'),
    [entries],
  )
  const virtual = useVirtualWindow(filtered.length, 34)
  const windowEntries = filtered.slice(virtual.start, virtual.end)

  return (
    <div ref={virtual.containerRef} class="viewport" onScroll={virtual.onScroll}>
      <div style={{ height: `${virtual.totalHeight}px` }}>
        <div style={{ transform: `translateY(${virtual.offsetTop}px)` }}>
          {windowEntries.map((entry, index) => (
            <div key={`${virtual.start + index}:${entry.path}`} class={`diff-row diff-row--${entry.kind}`}>
              <span class="diff-row__indicator">
                {entry.kind === 'added' ? '+' : entry.kind === 'removed' ? '−' : '~'}
              </span>
              <span class="diff-row__path">{entry.path}</span>
              {entry.kind === 'changed' ? (
                <span class="diff-row__values">
                  <span class="diff-row__old">{entry.oldValue}</span>
                  <span class="diff-row__arrow">→</span>
                  <span class="diff-row__new">{entry.newValue}</span>
                </span>
              ) : (
                <span class="diff-row__values">
                  <span>{entry.oldValue ?? entry.newValue}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function seedExpandedNodes(documentState: ParsedDocument): Set<number> {
  return new Set<number>([documentState.rootId])
}

function buildVisibleRows(documentState: ParsedDocument, expandedNodes: Set<number>): VisibleRow[] {
  const rows: VisibleRow[] = []
  const stack: VisibleRow[] = [{ nodeId: documentState.rootId, depth: 0 }]

  while (stack.length > 0) {
    const current = stack.pop()!
    rows.push(current)

    if (!expandedNodes.has(current.nodeId)) {
      continue
    }

    const node = documentState.nodes[current.nodeId]
    for (let index = node.childEnd - 1; index >= node.childStart; index -= 1) {
      stack.push({
        nodeId: documentState.childIds[index]!,
        depth: current.depth + 1,
      })
    }
  }

  return rows
}

function byteLabel(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function highlightLine(line: string, format?: ParsedDocument['format']): string {
  const escaped = escapeHtml(line)

  if (format === 'markdown') {
    return escaped
      .replace(/^(#{1,6})(\s.*)$/g, '<span class="token token--accent">$1</span><span class="token token--heading">$2</span>')
      .replace(/^(\s*[-*+]\s)/g, '<span class="token token--accent">$1</span>')
  }

  return escaped
    .replace(/("(?:\\.|[^"\\])*")(?=\s*:)/g, '<span class="token token--key">$1</span>')
    .replace(/(:\s*)("(?:\\.|[^"\\])*")/g, '$1<span class="token token--string">$2</span>')
    .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="token token--number">$1</span>')
    .replace(/\b(true|false|null)\b/g, '<span class="token token--accent">$1</span>')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function buildNodePath(doc: ParsedDocument, nodeId: number): string {
  const segments: string[] = []
  let current = nodeId
  while (current !== doc.rootId) {
    segments.unshift(doc.nodes[current].label)
    const parentId = doc.nodes[current].parentId
    if (parentId < 0) break
    current = parentId
  }
  return segments.length > 0 ? segments.join('.') : doc.nodes[nodeId]?.label ?? ''
}
