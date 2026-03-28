![Vaporsoft](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/vaporsoft-logo.svg) ![Kata](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/kata-icon.svg)

# Kata

**A local-first structured text parser and visualizer.**
Offline-capable, installable PWA — parse, inspect, and export entirely in-browser.

---

### Contents

- [Overview](#overview)
- [Performance](#performance)
- [Features](#features)
- [Stack](#stack)
- [Development](#development)
- [License](#license)

---

## Overview

Kata parses, visualizes, and transforms structured text formats with extreme performance constraints. Everything runs client-side — no backend, no telemetry, no network dependency after install.

| | |
|---|---|
| **6 input formats** | JSON, YAML, TOML, Markdown, INI, plain text |
| **4 export formats** | JSON, YAML, TOML, Markdown |
| **3 views** | Tree (virtualized), raw, cards |
| **6 themes** | Light, Dark, Flat Light, Flat Dark, High Contrast Light, High Contrast Dark |
| **Worker-based parsing** | All heavy lifting runs off the main thread |
| **Workspace mode** | Open a local folder via File System Access API |
| **Offline-capable** | Installable PWA with service worker precaching |

---

## Performance

Collected on AMD Ryzen 9 3950X, Chrome (headless), from `npm run perf:report`.

### Kata Spec Budgets

Source: [specification.md](specification.md) §6.1 Hard Constraints, §7 Bundle Strategy

| Budget | Status | Actual | Target |
|---|---|---|---|
| First render | **PASS** | 62.8 ms | ≤ 100 ms |
| View switch | **PASS** | 2.5 ms | ≤ 50 ms |
| Expand/collapse | **PASS** | 0.9 ms | ≤ 16 ms |
| Initial bundle (gzip) | **PASS** | 24 KB | ≤ 50 KB |
| Long tasks > 50 ms | **PASS** | 0 | 0 |

### Google Core Web Vitals

Source: [web.dev/articles/vitals](https://web.dev/articles/vitals)

| Metric | Status | Actual | Good |
|---|---|---|---|
| Largest Contentful Paint | **PASS** | 1,573 ms | ≤ 2,500 ms |
| Cumulative Layout Shift | **PASS** | 0 | ≤ 0.1 |
| Total Blocking Time | **PASS** | 7 ms | ≤ 200 ms |

### Lighthouse

Source: [Chrome Docs](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)

| Profile | Score | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|
| Mobile | **99** | 1,390 ms | 1,573 ms | 7 ms | 0 |
| Desktop | **90** | 1,315 ms | 1,575 ms | 10 ms | 0 |

> Reports archived in [`reports/performance/0.1.0-alpha/`](reports/performance/0.1.0-alpha/).

### Comparison

| Tool | Initial JS (gzip) | Offline | Workers | Formats |
|---|---|---|---|---|
| **Kata** | **21 KB** | Yes | Parse + Export | 6 in / 4 out |
| JSON Editor Online | ~350 KB | No | No | JSON |
| JSON Crack | ~800 KB | No | No | JSON + YAML |
| YAML Lint | ~120 KB | No | No | YAML |

---

## Features

- **Worker-based parsing** — all heavy lifting runs off the main thread
- **Six input formats** — JSON, YAML, TOML, Markdown, INI, plain text
- **Four export formats** — JSON, YAML, TOML, Markdown
- **Tree, raw, and card views** — virtualized for large files
- **Workspace mode** — open a local folder via File System Access API
- **Offline-capable** — installable PWA with service worker precaching
- **Six themes** — Light, Dark, Flat Light, Flat Dark, High Contrast Light, High Contrast Dark
- **Inline parsing** — files ≤ 64 KB parsed on main thread, bypassing worker overhead
- **Search & references** — full-text search with cross-reference detection
- **Diff mode** — structural comparison between documents

---

## Stack

- Vite 7
- Preact 10 + TypeScript 5.9
- Web Workers (parse + export)
- vite-plugin-pwa
- micromark, yaml, smol-toml, ini

---

## Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

The production build outputs to `dist/`.

### Preview

```bash
npm run preview
```

### Performance Report

```bash
npm run perf:report
```

Runs Lighthouse (mobile + desktop) and CDP app metrics against the production build. Results are written to `reports/performance/` and the sample profile is updated in `public/samples/`.

---

## License

[MIT](LICENSE) — Copyright © 2026 [Corderro Artz](https://github.com/corderro-artz) / [Vaporsoft](https://www.vaporsoft.dev)
