[![Vaporsoft](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/vaporsoft-logo.svg)](https://www.vaporsoft.dev)
[![Kata](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/kata-icon.svg)](https://corderro-artz.github.io/kata/)

# Kata

**A local-first structured text parser and visualizer.**
Worker-first, offline-capable, and installable as a PWA.

[![CI](https://img.shields.io/github/actions/workflow/status/corderro-artz/kata/ci.yml?branch=main&label=CI&logo=githubactions&logoColor=white)](https://github.com/corderro-artz/kata/actions/workflows/ci.yml)
[![Deploy Pages](https://img.shields.io/github/actions/workflow/status/corderro-artz/kata/deploy-pages.yml?branch=main&label=Pages&logo=githubactions&logoColor=white)](https://github.com/corderro-artz/kata/actions/workflows/deploy-pages.yml)
[![Live Site](https://img.shields.io/website?url=https%3A%2F%2Fcorderro-artz.github.io%2Fkata%2F&label=Live%20Site&logo=githubpages&logoColor=white)](https://corderro-artz.github.io/kata/)
[![Release](https://img.shields.io/github/v/tag/corderro-artz/kata?sort=semver&label=Release&logo=git&logoColor=white)](https://github.com/corderro-artz/kata/tags)
[![License](https://img.shields.io/github/license/corderro-artz/kata?label=License)](https://github.com/corderro-artz/kata/blob/main/LICENSE)
[![Node 20+](https://img.shields.io/badge/Node-20%2B-5FA04E?logo=nodedotjs&logoColor=white)](https://github.com/corderro-artz/kata/blob/main/package.json)

[![Bundle Gzip](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Fbundle-gzip.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)
[![First Render](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Ffirst-render.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)
[![View Switch](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Fview-switch.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)
[![Lighthouse Mobile](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Flighthouse-mobile.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)
[![Lighthouse Desktop](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Flighthouse-desktop.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)
[![Long Tasks](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Flong-tasks.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)

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
| Export formats | JSON, YAML, TOML, Markdown, INI, XAML, plain text |
| Views | Tree, Raw, Diff |
| Raw preview controls | Show/hide preview pane, vertical split, horizontal split |
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
| First render | PASS | 59.37 ms | <= 100 ms |
| View switch | PASS | 2.37 ms | <= 50 ms |
| Expand/collapse | PASS | 0.87 ms | <= 16 ms |
| Long tasks over 50 ms | PASS | 0 count | 0 count |
| Initial bundle gzip | PASS | 27,319 B | <= 51,200 B |
| Lighthouse mobile score | PASS | 100 | >= 90 |
| Lighthouse desktop score | PASS | 90 | >= 90 |

| Lighthouse detail | Actual |
| --- | --- |
| Mobile FCP | 1316.71 ms |
| Mobile LCP | 1579.54 ms |
| Mobile TBT | 12.83 ms |
| Desktop FCP | 1314.07 ms |
| Desktop LCP | 1574.07 ms |
| Desktop TBT | 10 ms |

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
