[![Vaporsoft](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/vaporsoft-logo.svg)](https://www.vaporsoft.dev)
[![Kata](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/kata-icon.svg)](https://corderro-artz.github.io/kata/)

# Kata

A local-first structured text parser and visualizer.
Worker-first, offline-capable, and installable as a PWA.

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
| Views | Tree, Raw, Cards, Diff |
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
	+-- Virtualized renderers (tree/raw/cards/diff)
	+-- Search/index/reference graph
	+-- PWA shell + cache
```

## Performance

Latest dry-run summary is tracked in [reports/performance/latest.md](reports/performance/latest.md).

| Metric | Latest |
| --- | --- |
| First render | 61.77 ms |
| Max view switch | 2.23 ms |
| Max tree toggle | 0.8 ms |
| Long tasks over 50 ms | 0 |
| Initial bundle gzip | 25,365 B |
| Lighthouse mobile | 100 |
| Lighthouse desktop | 90 |

## Deployment

GitHub Pages deploy is automated by [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml).

Live URL:
https://corderro-artz.github.io/kata/

## Links

| Resource | URL |
| --- | --- |
| Repository | https://github.com/corderro-artz/kata |
| Pages | https://corderro-artz.github.io/kata/ |
| Releases | https://github.com/corderro-artz/kata/releases |
| Actions | https://github.com/corderro-artz/kata/actions |
| Vaporsoft | https://www.vaporsoft.dev |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run npm run check and npm run build
4. Open a pull request

## License

[MIT](LICENSE) - Copyright (c) 2026 Corderro Artz / Vaporsoft
