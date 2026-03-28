import { spawn } from 'node:child_process'
import { gzipSync } from 'node:zlib'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { promises as fs } from 'node:fs'

import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import CDP from 'chrome-remote-interface'

const projectRoot = process.cwd()
const packageJsonPath = path.join(projectRoot, 'package.json')
const baselinesPath = path.join(projectRoot, 'performance', 'baselines.json')
const distPath = path.join(projectRoot, 'dist')
const publicSamplesRoot = path.join(projectRoot, 'public', 'samples')
const reportsRoot = path.join(projectRoot, 'reports', 'performance')
const chromeProfileRoot = path.join(projectRoot, '.tmp', 'chrome-profile')

async function main() {
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  const baselines = JSON.parse(await fs.readFile(baselinesPath, 'utf8'))
  const version = packageJson.version
  const generatedAt = new Date().toISOString()
  const previewPort = 4173
  const previewUrl = `http://127.0.0.1:${previewPort}/`

  const buildStartedAt = performance.now()
  await runCommand(getNpmCommand(), ['run', 'build'], 'Build production bundle for performance profiling')
  const buildDurationMs = round(performance.now() - buildStartedAt)

  const bundle = await collectBundleStats(distPath)

  const previewServerCommand = toSpawnCommand(getNpmCommand(), [
    'run',
    'preview',
    '--',
    '--host',
    '127.0.0.1',
    '--port',
    String(previewPort),
    '--strictPort',
  ])
  const previewServer = spawn(previewServerCommand.command, previewServerCommand.args, {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  })

  let previewLogs = ''
  previewServer.stdout.on('data', (chunk) => {
    previewLogs += chunk.toString()
  })
  previewServer.stderr.on('data', (chunk) => {
    previewLogs += chunk.toString()
  })

  await waitForServer(previewUrl, 20_000, previewLogs)

  await cleanupChromeProfile()
  await fs.mkdir(chromeProfileRoot, { recursive: true })

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless=new', '--disable-gpu', '--no-sandbox'],
    logLevel: 'silent',
    userDataDir: chromeProfileRoot,
  })

  try {
    const gitInfo = await readGitInfo()
    const mobileAudit = await runLighthouseAudit(previewUrl, chrome.port, 'mobile')
    const desktopAudit = await runLighthouseAudit(previewUrl, chrome.port, 'desktop')
    const appMetrics = await collectAppMetrics(previewUrl, chrome.port)

    const reportContext = buildReportContext({
      version,
      generatedAt,
      buildDurationMs,
      baselines,
      bundle,
      mobileAudit,
      desktopAudit,
      appMetrics,
      gitInfo,
        chromePath: chrome.executablePath ?? chrome.chromePath ?? 'unknown',
    })

    const versionDir = path.join(reportsRoot, version)
    await Promise.all([
      fs.mkdir(versionDir, { recursive: true }),
      fs.mkdir(publicSamplesRoot, { recursive: true }),
    ])

    const summaryJson = JSON.stringify(reportContext, null, 2)
    const summaryMarkdown = renderMarkdown(reportContext)
    const latestSamplePath = path.join(publicSamplesRoot, 'latest-profile.json')
    const distSamplePath = path.join(distPath, 'samples', 'latest-profile.json')
    await fs.mkdir(path.dirname(distSamplePath), { recursive: true })

    await Promise.all([
      fs.writeFile(path.join(versionDir, 'summary.json'), summaryJson),
      fs.writeFile(path.join(versionDir, 'summary.md'), summaryMarkdown),
      fs.writeFile(path.join(versionDir, 'lighthouse.mobile.report.json'), JSON.stringify(mobileAudit.lhr, null, 2)),
      fs.writeFile(path.join(versionDir, 'lighthouse.desktop.report.json'), JSON.stringify(desktopAudit.lhr, null, 2)),
      fs.writeFile(path.join(versionDir, 'lighthouse.mobile.report.html'), mobileAudit.html),
      fs.writeFile(path.join(versionDir, 'lighthouse.desktop.report.html'), desktopAudit.html),
      fs.writeFile(path.join(reportsRoot, 'latest.json'), summaryJson),
      fs.writeFile(path.join(reportsRoot, 'latest.md'), summaryMarkdown),
      fs.writeFile(latestSamplePath, summaryJson),
      fs.writeFile(distSamplePath, summaryJson),
    ])

    process.stdout.write(`Performance report written to reports/performance/${version}/summary.md\n`)
  } finally {
    await chrome.kill()
    await cleanupChromeProfile()
    previewServer.kill()
  }
}

async function cleanupChromeProfile() {
  await fs.rm(chromeProfileRoot, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 200,
  }).catch(() => undefined)
}

async function runLighthouseAudit(url, port, preset) {
  const isDesktop = preset === 'desktop'
  const runnerResult = await lighthouse(url, {
    port,
    output: ['html', 'json'],
    logLevel: 'error',
    onlyCategories: ['performance'],
    formFactor: isDesktop ? 'desktop' : 'mobile',
    screenEmulation: isDesktop
      ? {
          mobile: false,
          width: 1440,
          height: 960,
          deviceScaleFactor: 1,
          disabled: false,
        }
      : undefined,
  })

  const reports = Array.isArray(runnerResult.report) ? runnerResult.report : [runnerResult.report]
  const html = reports.find((report) => typeof report === 'string' && report.startsWith('<!doctype html>')) ?? ''
  const lhr = runnerResult.lhr

  return {
    html,
    lhr,
    summary: {
      preset,
      performanceScore: round((lhr.categories.performance.score ?? 0) * 100),
      firstContentfulPaintMs: round(lhr.audits['first-contentful-paint'].numericValue ?? 0),
      speedIndexMs: round(lhr.audits['speed-index'].numericValue ?? 0),
      largestContentfulPaintMs: round(lhr.audits['largest-contentful-paint'].numericValue ?? 0),
      totalBlockingTimeMs: round(lhr.audits['total-blocking-time'].numericValue ?? 0),
      cumulativeLayoutShift: round(lhr.audits['cumulative-layout-shift'].numericValue ?? 0),
      mainThreadWorkBreakdownMs: round(lhr.audits['mainthread-work-breakdown'].numericValue ?? 0),
      scriptBootupTimeMs: round(lhr.audits['bootup-time'].numericValue ?? 0),
    },
  }
}

async function collectAppMetrics(url, port) {
  const client = await CDP({ port })
  const { Page, Runtime } = client

  await Promise.all([Page.enable(), Runtime.enable()])
  await Page.navigate({ url })
  await waitForExpression(Runtime, 'document.readyState === "complete"', 15_000)
  await waitForExpression(Runtime, 'Boolean(window.__kataPerf?.ready && window.__kataPerf?.initialReadyMs !== null)', 15_000)

  const startup = await evaluate(Runtime, 'window.__kataPerf')
  const navigation = await evaluate(
    Runtime,
    `(() => {
      const nav = performance.getEntriesByType('navigation')[0]
      return nav ? {
        domContentLoadedMs: nav.domContentLoadedEventEnd,
        loadEventMs: nav.loadEventEnd,
      } : null
    })()`,
  )
  const memory = await evaluate(
    Runtime,
    `(() => {
      const value = performance.memory
      return value ? {
        usedJSHeapSize: value.usedJSHeapSize,
        totalJSHeapSize: value.totalJSHeapSize,
        jsHeapSizeLimit: value.jsHeapSizeLimit,
      } : null
    })()`,
  )

  const rawView = await evaluate(
    Runtime,
    `(async () => {
      const button = document.querySelector('[data-kata-view="raw"]')
      if (!button) throw new Error('Missing raw view button')
      button.click()
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      return window.__kataPerf
    })()`,
  )

  const cardsView = await evaluate(
    Runtime,
    `(async () => {
      const button = document.querySelector('[data-kata-view="cards"]')
      if (!button) throw new Error('Missing cards view button')
      button.click()
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      return window.__kataPerf
    })()`,
  )

  const treeView = await evaluate(
    Runtime,
    `(async () => {
      const button = document.querySelector('[data-kata-view="tree"]')
      if (!button) throw new Error('Missing tree view button')
      button.click()
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      return window.__kataPerf
    })()`,
  )

  const collapseToggle = await evaluate(
    Runtime,
    `(async () => {
      const toggle = [...document.querySelectorAll('[data-kata-tree-toggle="true"]')]
        .find((node) => node.getAttribute('data-kata-empty') !== 'true')
      if (!toggle) throw new Error('Missing populated tree toggle')
      toggle.click()
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      return window.__kataPerf
    })()`,
  )

  const expandToggle = await evaluate(
    Runtime,
    `(async () => {
      const toggle = [...document.querySelectorAll('[data-kata-tree-toggle="true"]')]
        .find((node) => node.getAttribute('data-kata-empty') !== 'true')
      if (!toggle) throw new Error('Missing populated tree toggle')
      toggle.click()
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      return window.__kataPerf
    })()`,
  )

  client.close()

  return {
    startup,
    navigation,
    memory,
    interactions: {
      rawView,
      cardsView,
      treeView,
      collapseToggle,
      expandToggle,
    },
  }
}

function buildReportContext({
  version,
  generatedAt,
  buildDurationMs,
  baselines,
  bundle,
  mobileAudit,
  desktopAudit,
  appMetrics,
  gitInfo,
  chromePath,
}) {
  const interactionSnapshots = collectInteractionSnapshots(appMetrics)
  const flattenedMetrics = {
    firstRenderMs: appMetrics.startup.initialReadyMs,
    maxViewSwitchMs: maxFrom(interactionSnapshots.map((snapshot) => snapshot.latestViewSwitchMs).filter(isNumber)),
    maxTreeToggleMs: maxFrom(interactionSnapshots.map((snapshot) => snapshot.latestTreeToggleMs).filter(isNumber)),
    longTaskCount: maxFrom(interactionSnapshots.map((snapshot) => snapshot.longTasks?.count).filter(isNumber)) ?? appMetrics.startup.longTasks.count,
    initialBundleGzipBytes: bundle.initial.gzipBytes,
    mobileLcpMs: mobileAudit.summary.largestContentfulPaintMs,
    mobileCls: mobileAudit.summary.cumulativeLayoutShift,
    mobilePerformanceScore: mobileAudit.summary.performanceScore,
    desktopPerformanceScore: desktopAudit.summary.performanceScore,
  }

  const projectChecks = baselines.project.targets.map((target) => {
    const actual = flattenedMetrics[target.metric] ?? null
    return {
      ...target,
      actual,
      status: evaluateTarget(actual, target.operator, target.target),
    }
  })

  const verifiedChecks = baselines.verified.map((baseline) => ({
    ...baseline,
    results: baseline.targets.map((target) => {
      const actual = flattenedMetrics[target.metric] ?? null
      return {
        ...target,
        actual,
        status: evaluateTarget(actual, target.operator, target.target),
      }
    }),
  }))

  return {
    generatedAt,
    version,
    git: gitInfo,
    environment: {
      node: process.version,
      platform: `${process.platform} ${process.arch}`,
      cpu: os.cpus()[0]?.model ?? 'unknown',
      chromePath,
    },
    build: {
      durationMs: buildDurationMs,
    },
    bundle,
    app: appMetrics,
    lighthouse: {
      mobile: mobileAudit.summary,
      desktop: desktopAudit.summary,
    },
    checks: {
      project: projectChecks,
      verified: verifiedChecks,
    },
    sources: {
      project: baselines.project.source,
      verified: baselines.verified.map((baseline) => ({
        name: baseline.name,
        source: baseline.source,
        verifiedAt: baseline.verifiedAt,
      })),
    },
  }
}

async function collectBundleStats(rootDistPath) {
  const files = await listFiles(rootDistPath)
  const allAssets = []

  for (const filePath of files) {
    const relativePath = path.relative(rootDistPath, filePath).replaceAll('\\', '/')
    const content = await fs.readFile(filePath)
    allAssets.push({
      path: relativePath,
      rawBytes: content.byteLength,
      gzipBytes: gzipSync(content).byteLength,
    })
  }

  const indexHtml = await fs.readFile(path.join(rootDistPath, 'index.html'), 'utf8')
  const initialPaths = [...indexHtml.matchAll(/(?:src|href)="\/(assets\/[^\"]+)"/g)].map((match) => match[1])
  const initialAssets = allAssets.filter((asset) => initialPaths.includes(asset.path))

  return {
    initial: summarizeAssets(initialAssets),
    total: summarizeAssets(allAssets),
    assets: allAssets,
  }
}

function summarizeAssets(assets) {
  return {
    rawBytes: assets.reduce((sum, asset) => sum + asset.rawBytes, 0),
    gzipBytes: assets.reduce((sum, asset) => sum + asset.gzipBytes, 0),
    files: assets,
  }
}

async function listFiles(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const resolved = path.join(directoryPath, entry.name)
      if (entry.isDirectory()) {
        return listFiles(resolved)
      }

      return [resolved]
    }),
  )

  return nested.flat()
}

async function readGitInfo() {
  try {
    const commit = (await runCommand('git', ['rev-parse', 'HEAD'], 'Resolve current git commit', true)).trim()
    const branch = (await runCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD'], 'Resolve current git branch', true)).trim()
    return { commit, branch }
  } catch {
    return { commit: 'unavailable', branch: 'unavailable' }
  }
}

async function waitForServer(url, timeoutMs, logs) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      await sleep(250)
      continue
    }

    await sleep(250)
  }

  throw new Error(`Timed out waiting for preview server at ${url}.\n${logs}`)
}

async function waitForExpression(Runtime, expression, timeoutMs) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const value = await evaluate(Runtime, expression)
    if (value) {
      return value
    }

    await sleep(150)
  }

  throw new Error(`Timed out waiting for browser expression: ${expression}`)
}

async function evaluate(Runtime, expression) {
  const response = await Runtime.evaluate({
    expression,
    awaitPromise: true,
    returnByValue: true,
  })

  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || 'Browser evaluation failed')
  }

  return response.result.value
}

async function runCommand(command, args, description, captureOnly = false) {
  return new Promise((resolve, reject) => {
    const resolved = toSpawnCommand(command, args)
    const child = spawn(resolved.command, resolved.args, {
      cwd: projectRoot,
      stdio: captureOnly ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
      shell: false,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      reject(error)
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
        return
      }

      reject(new Error(`${description} failed with exit code ${code}.\n${stdout}\n${stderr}`))
    })
  })
}

function renderMarkdown(context) {
  const projectRows = context.checks.project
    .map((check) => `| ${check.label} | ${renderStatus(check.status)} | ${formatMetric(check.actual, check.unit)} | ${formatMetric(check.target, check.unit)} | ${check.sourceSection} |`)
    .join('\n')

  const verifiedSections = context.checks.verified
    .map((baseline) => {
      const rows = baseline.results
        .map((result) => `| ${result.label} | ${renderStatus(result.status)} | ${formatMetric(result.actual, result.unit)} | ${formatMetric(result.target, result.unit)} | ${result.note ?? ''} |`)
        .join('\n')

      const notes = baseline.notes.map((note) => `- ${note}`).join('\n')
      return `## ${baseline.name}\n\nSource: ${baseline.source}\n\n| Metric | Status | Actual | Target | Note |\n| --- | --- | --- | --- | --- |\n${rows}\n\n${notes}`
    })
    .join('\n\n')

  return `# Kata Performance Report\n\n- Version: ${context.version}\n- Generated: ${context.generatedAt}\n- Commit: ${context.git.commit}\n- Branch: ${context.git.branch}\n\n## Environment\n\n- Node: ${context.environment.node}\n- Platform: ${context.environment.platform}\n- CPU: ${context.environment.cpu}\n- Chrome: ${context.environment.chromePath}\n- Build duration: ${formatMetric(context.build.durationMs, 'ms')}\n\n## Kata Spec Budgets\n\nSource: ${context.sources.project}\n\n| Budget | Status | Actual | Target | Source |\n| --- | --- | --- | --- | --- |\n${projectRows}\n\n## Bundle\n\n- Initial raw: ${formatMetric(context.bundle.initial.rawBytes, 'bytes')}\n- Initial gzip: ${formatMetric(context.bundle.initial.gzipBytes, 'bytes')}\n- Total raw: ${formatMetric(context.bundle.total.rawBytes, 'bytes')}\n- Total gzip: ${formatMetric(context.bundle.total.gzipBytes, 'bytes')}\n\n## Lighthouse\n\n### Mobile\n\n- Score: ${formatMetric(context.lighthouse.mobile.performanceScore, 'score')}\n- FCP: ${formatMetric(context.lighthouse.mobile.firstContentfulPaintMs, 'ms')}\n- Speed Index: ${formatMetric(context.lighthouse.mobile.speedIndexMs, 'ms')}\n- LCP: ${formatMetric(context.lighthouse.mobile.largestContentfulPaintMs, 'ms')}\n- TBT: ${formatMetric(context.lighthouse.mobile.totalBlockingTimeMs, 'ms')}\n- CLS: ${formatMetric(context.lighthouse.mobile.cumulativeLayoutShift, 'score')}\n- Main-thread work: ${formatMetric(context.lighthouse.mobile.mainThreadWorkBreakdownMs, 'ms')}\n- Script bootup: ${formatMetric(context.lighthouse.mobile.scriptBootupTimeMs, 'ms')}\n\n### Desktop\n\n- Score: ${formatMetric(context.lighthouse.desktop.performanceScore, 'score')}\n- FCP: ${formatMetric(context.lighthouse.desktop.firstContentfulPaintMs, 'ms')}\n- Speed Index: ${formatMetric(context.lighthouse.desktop.speedIndexMs, 'ms')}\n- LCP: ${formatMetric(context.lighthouse.desktop.largestContentfulPaintMs, 'ms')}\n- TBT: ${formatMetric(context.lighthouse.desktop.totalBlockingTimeMs, 'ms')}\n- CLS: ${formatMetric(context.lighthouse.desktop.cumulativeLayoutShift, 'score')}\n- Main-thread work: ${formatMetric(context.lighthouse.desktop.mainThreadWorkBreakdownMs, 'ms')}\n- Script bootup: ${formatMetric(context.lighthouse.desktop.scriptBootupTimeMs, 'ms')}\n\n## App Interaction Metrics\n\n- First render: ${formatMetric(context.app.startup.initialReadyMs, 'ms')}\n- Parse worker time: ${formatMetric(context.app.startup.parseMs, 'ms')}\n- Parse node count: ${context.app.startup.parseNodeCount ?? 'n/a'}\n- Max view switch: ${formatMetric(maxInteractionValue(context.app, 'latestViewSwitchMs'), 'ms')}\n- Max tree toggle: ${formatMetric(maxInteractionValue(context.app, 'latestTreeToggleMs'), 'ms')}\n- Long tasks: ${maxLongTaskCount(context.app)}\n- Max long task: ${formatMetric(maxLongTaskDuration(context.app), 'ms')}\n- DOMContentLoaded: ${formatMetric(context.app.navigation?.domContentLoadedMs ?? null, 'ms')}\n- Load event: ${formatMetric(context.app.navigation?.loadEventMs ?? null, 'ms')}\n- JS heap used: ${formatMetric(context.app.memory?.usedJSHeapSize ?? null, 'bytes')}\n\n${verifiedSections}\n`
}

function evaluateTarget(actual, operator, target) {
  if (actual === null || actual === undefined) {
    return 'unknown'
  }

  if (operator === '<=') {
    return actual <= target ? 'pass' : 'fail'
  }

  return actual >= target ? 'pass' : 'fail'
}

function renderStatus(status) {
  if (status === 'pass') {
    return 'PASS'
  }
  if (status === 'fail') {
    return 'FAIL'
  }
  return 'UNKNOWN'
}

function formatMetric(value, unit) {
  if (value === null || value === undefined) {
    return 'n/a'
  }

  if (unit === 'bytes') {
    return `${(value / 1024).toFixed(2)} KB (${value} B)`
  }

  if (unit === 'score') {
    return typeof value === 'number' ? String(round(value)) : String(value)
  }

  return `${round(value)} ${unit}`
}

function maxFrom(values) {
  if (!values || values.length === 0) {
    return null
  }

  return Math.max(...values)
}

function collectInteractionSnapshots(appMetrics) {
  return Object.values(appMetrics.interactions ?? {}).filter(Boolean)
}

function maxInteractionValue(appMetrics, key) {
  return maxFrom(collectInteractionSnapshots(appMetrics).map((snapshot) => snapshot[key]).filter(isNumber))
}

function maxLongTaskCount(appMetrics) {
  const snapshots = [appMetrics.startup, ...collectInteractionSnapshots(appMetrics)]
  return maxFrom(snapshots.map((snapshot) => snapshot.longTasks?.count).filter(isNumber)) ?? 0
}

function maxLongTaskDuration(appMetrics) {
  const snapshots = [appMetrics.startup, ...collectInteractionSnapshots(appMetrics)]
  return maxFrom(snapshots.map((snapshot) => snapshot.longTasks?.maxDuration).filter(isNumber))
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm'
}

function toSpawnCommand(command, args) {
  if (process.platform === 'win32' && command.toLowerCase().endsWith('.cmd')) {
    return {
      command: 'cmd.exe',
      args: ['/d', '/s', '/c', command, ...args],
    }
  }

  return { command, args }
}

function round(value) {
  return Math.round(value * 100) / 100
}

function sleep(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs))
}

await main()