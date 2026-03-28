import type { DocumentStats, ViewMode } from './types'

interface LongTaskStats {
  count: number
  maxDuration: number
  totalDuration: number
}

export interface KataPerfSnapshot {
  ready: boolean
  initialReadyMs: number | null
  currentView: ViewMode
  parseMs: number | null
  parseNodeCount: number | null
  latestViewSwitchMs: number | null
  latestTreeToggleMs: number | null
  viewSwitchSamples: number[]
  treeToggleSamples: number[]
  longTasks: LongTaskStats
  lastUpdatedAt: number
}

declare global {
  interface Window {
    __kataPerf?: KataPerfSnapshot
  }
}

const MAX_SAMPLES = 8
const startupAt = performance.now()

let pendingViewSwitchAt: number | null = null
let pendingTreeToggleAt: number | null = null
let observersStarted = false

const store = getOrCreateStore()

export function startPerformanceObservers(): void {
  if (observersStarted || typeof window === 'undefined') {
    return
  }

  observersStarted = true

  if (!('PerformanceObserver' in window)) {
    return
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      store.longTasks.count += 1
      store.longTasks.maxDuration = Math.max(store.longTasks.maxDuration, round(entry.duration))
      store.longTasks.totalDuration = round(store.longTasks.totalDuration + entry.duration)
    }
    store.lastUpdatedAt = Date.now()
  })

  observer.observe({ entryTypes: ['longtask'] as string[] })
}

export function recordParsedDocument(stats: DocumentStats): void {
  store.parseMs = stats.parseMs
  store.parseNodeCount = stats.nodeCount
  store.lastUpdatedAt = Date.now()
}

export function markInitialReady(): void {
  if (store.ready) {
    return
  }

  store.ready = true
  store.initialReadyMs = round(performance.now() - startupAt)
  store.lastUpdatedAt = Date.now()
}

export function beginViewSwitch(): void {
  pendingViewSwitchAt = performance.now()
}

export function flushViewSwitch(currentView: ViewMode): void {
  store.currentView = currentView

  if (pendingViewSwitchAt === null) {
    store.lastUpdatedAt = Date.now()
    return
  }

  const duration = round(performance.now() - pendingViewSwitchAt)
  pendingViewSwitchAt = null
  store.latestViewSwitchMs = duration
  pushSample(store.viewSwitchSamples, duration)
  store.lastUpdatedAt = Date.now()
}

export function beginTreeToggle(): void {
  pendingTreeToggleAt = performance.now()
}

export function flushTreeToggle(): void {
  if (pendingTreeToggleAt === null) {
    return
  }

  const duration = round(performance.now() - pendingTreeToggleAt)
  pendingTreeToggleAt = null
  store.latestTreeToggleMs = duration
  pushSample(store.treeToggleSamples, duration)
  store.lastUpdatedAt = Date.now()
}

function getOrCreateStore(): KataPerfSnapshot {
  if (!window.__kataPerf) {
    window.__kataPerf = {
      ready: false,
      initialReadyMs: null,
      currentView: 'tree',
      parseMs: null,
      parseNodeCount: null,
      latestViewSwitchMs: null,
      latestTreeToggleMs: null,
      viewSwitchSamples: [],
      treeToggleSamples: [],
      longTasks: {
        count: 0,
        maxDuration: 0,
        totalDuration: 0,
      },
      lastUpdatedAt: Date.now(),
    }
  }

  return window.__kataPerf
}

function pushSample(target: number[], value: number): void {
  target.push(value)
  if (target.length > MAX_SAMPLES) {
    target.shift()
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}