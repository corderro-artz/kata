[![Vaporsoft](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/vaporsoft-logo.svg)](https://www.vaporsoft.dev)
[![Kata](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/kata-icon.svg)](https://corderro-artz.github.io/kata/)

# Kata

**A local-first structured text parser and visualizer.**
Worker-first, offline-capable, and installable as a PWA.

[![Open App](https://img.shields.io/badge/Open%20App-Kata-8b1e2b?style=for-the-badge)](https://corderro-artz.github.io/kata/)

### Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Performance](#performance)
- [Deployment](#deployment)
- [Links](#links)
- [Contributing](#contributing)
- [License](#license)

## Overview

Kata parses, inspects, compares, and exports structured text entirely in-browser.
No backend is required after the app is loaded.

| Capability | Details |
| --- | --- |
| Input formats | JSON, YAML, TOML, Markdown, INI, plain text |
| Export formats | JSON, YAML, TOML, Markdown |
| Views | Tree, Raw, Diff |
| Runtime model | Worker-based parse and export |
| Local file support | File picker + workspace folder mode |
| PWA | Installable, offline-capable |

## Requirements

- Node.js 20+
- npm 10+
- Chromium-based browser for full File System Access features

## Installation

```bash
npm install
```

## Quick Start

```bash
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Architecture

```text
App UI (Preact + Signals)
	|
	+-- Parse Worker  -> structured document model
	+-- Export Worker -> format conversion output
	|
	+-- Virtualized renderers (tree/raw/diff)
	+-- Search/index/reference graph
	+-- PWA shell + cache
```

## Performance

Latest dry-run summary is tracked in [reports/performance/latest.md](reports/performance/latest.md).

| Budget | Status | Actual | Target |
| --- | --- | --- | --- |
| First render | PASS | 61.77 ms | <= 100 ms |
| View switch | PASS | 2.23 ms | <= 50 ms |
| Expand/collapse | PASS | 0.8 ms | <= 16 ms |
| Long tasks over 50 ms | PASS | 0 count | 0 count |
| Initial bundle gzip | PASS | 25,365 B | <= 51,200 B |
| Lighthouse mobile score | PASS | 100 | >= 90 |
| Lighthouse desktop score | PASS | 90 | >= 90 |

| Lighthouse detail | Actual |
| --- | --- |
| Mobile FCP | 1314.39 ms |
| Mobile LCP | 1573.39 ms |
| Mobile TBT | 9 ms |
| Desktop FCP | 1312.85 ms |
| Desktop LCP | 1571.35 ms |
| Desktop TBT | 8.5 ms |

## Deployment

GitHub Pages deploy is automated by [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml).

Primary live URL: https://corderro-artz.github.io/kata/

## Links

| Resource | URL |
| --- | --- |
| Repository | https://github.com/corderro-artz/kata |
| Live site | https://corderro-artz.github.io/kata/ |
| Releases | https://github.com/corderro-artz/kata/releases |
| Tags | https://github.com/corderro-artz/kata/tags |
| Actions | https://github.com/corderro-artz/kata/actions |
| Issues | https://github.com/corderro-artz/kata/issues |
| Pull requests | https://github.com/corderro-artz/kata/pulls |
| Security | https://github.com/corderro-artz/kata/security |
| Insights | https://github.com/corderro-artz/kata/pulse |
| License | https://github.com/corderro-artz/kata/blob/main/LICENSE |
| Vaporsoft | https://www.vaporsoft.dev |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run npm run check and npm run build
4. Open a pull request

## License

[MIT](https://github.com/corderro-artz/kata/blob/main/LICENSE) - Copyright © 2026 [Corderro Artz](https://github.com/corderro-artz) / [Vaporsoft](https://www.vaporsoft.dev)
