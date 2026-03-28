![Vaporsoft](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/vaporsoft-logo.svg) ![Kata](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/kata-icon.svg)

# Kata

Local-first structured text parser and visualizer. Parse, inspect, and export
JSON, YAML, TOML, Markdown, INI, and plain text — entirely offline, entirely
in-browser.

## Features

- **Worker-based parsing** — all heavy lifting runs off the main thread
- **Six input formats** — JSON, YAML, TOML, Markdown, INI, plain text
- **Four export formats** — JSON, YAML, TOML, Markdown
- **Tree, raw, and card views** — virtualized for large files
- **Workspace mode** — open a local folder via File System Access API
- **Offline-capable** — installable PWA with service worker precaching
- **Six themes** — Light, Dark, Flat Light, Flat Dark, High Contrast Light, High Contrast Dark

## Stack

- Vite 7
- Preact + TypeScript
- Web Workers (parse + export)
- vite-plugin-pwa
- micromark, yaml, smol-toml, ini

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build outputs to `dist/`.

## Preview

```bash
npm run preview
```

## Performance

Collected on AMD Ryzen 9 3950X, Chrome, from `npm run perf:report`.

### Budgets

| Metric | Result | Actual | Target |
| --- | --- | --- | --- |
| First render | FAIL | 158 ms | < 100 ms |
| View switch | **PASS** | 4.8 ms | < 50 ms |
| Expand/collapse | **PASS** | 15.8 ms | < 16 ms |
| Initial bundle (gzip) | FAIL | 84 KB | < 50 KB |
| Long tasks > 50 ms | **PASS** | 0 | 0 |

### Core Web Vitals

Source: [web.dev/articles/vitals](https://web.dev/articles/vitals)

| Metric | Result | Actual | Good |
| --- | --- | --- | --- |
| Largest Contentful Paint | **PASS** | 1,957 ms | ≤ 2,500 ms |
| Cumulative Layout Shift | **PASS** | 0 | ≤ 0.1 |
| Total Blocking Time | **PASS** | 0 ms | ≤ 200 ms |

### Lighthouse

Source: [Chrome Docs](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)

| Profile | Score | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- |
| Mobile | **98** | 1,807 ms | 1,957 ms | 0 ms | 0 |
| Desktop | 81 | 1,807 ms | 2,107 ms | 0 ms | 0.04 |

### Comparison

| Tool | Initial JS (gzip) | Offline | Workers | Formats |
| --- | --- | --- | --- | --- |
| **Kata** | **17 KB** | Yes | Parse + Export | 6 in / 4 out |
| JSON Editor Online | ~350 KB | No | No | JSON |
| JSON Crack | ~800 KB | No | No | JSON + YAML |
| YAML Lint | ~120 KB | No | No | YAML |

JS payload is 17 KB gzipped. The 84 KB initial total includes CSS with embedded font subsets
(Manrope, Syncopate, Zen Kaku Gothic New) required for brand consistency.

---

## License

[MIT](LICENSE) — Copyright © 2026 [Corderro Artz](https://github.com/corderro-artz) / [Vaporsoft](https://www.vaporsoft.dev)
