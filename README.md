[![Vaporsoft](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/vaporsoft-logo.svg)](https://www.vaporsoft.dev)
[![Kata](https://raw.githubusercontent.com/corderro-artz/corderro-artz.github.io/main/public/kata-icon.svg)](https://corderro-artz.github.io/kata/)

# Kata

**A local-first structured text parser and visualizer.**

Kata is a worker-first, offline-capable PWA for parsing, inspecting, comparing, and exporting structured text directly in the browser. It is designed for mixed audiences: fast enough for performance-sensitive workflows, but approachable enough for developers who need a self-contained tool with no backend dependency after load.

**Access**  
[![Live Site](https://img.shields.io/website?url=https%3A%2F%2Fcorderro-artz.github.io%2Fkata%2F&label=Live%20Site&logo=githubpages&logoColor=white)](https://corderro-artz.github.io/kata/)

**Delivery**  
[![CI](https://img.shields.io/github/actions/workflow/status/corderro-artz/kata/ci.yml?branch=main&label=CI&logo=githubactions&logoColor=white)](https://github.com/corderro-artz/kata/actions/workflows/ci.yml)
[![Deploy Pages](https://img.shields.io/github/actions/workflow/status/corderro-artz/kata/deploy-pages.yml?branch=main&label=Pages&logo=githubactions&logoColor=white)](https://github.com/corderro-artz/kata/actions/workflows/deploy-pages.yml)
[![Performance Report](https://img.shields.io/github/actions/workflow/status/corderro-artz/kata/perf-report.yml?branch=main&label=Perf%20Report&logo=githubactions&logoColor=white)](https://github.com/corderro-artz/kata/actions/workflows/perf-report.yml)
[![Release](https://img.shields.io/github/v/tag/corderro-artz/kata?sort=semver&label=Release&logo=git&logoColor=white)](https://github.com/corderro-artz/kata/tags)
[![License: MIT](https://img.shields.io/badge/License-MIT-F7C948?logo=open-source-initiative&logoColor=white)](https://github.com/corderro-artz/kata/blob/main/LICENSE)

**Runtime**  
[![Node 20+](https://img.shields.io/badge/Node-20%2B-5FA04E?logo=nodedotjs&logoColor=white)](https://github.com/corderro-artz/kata/blob/main/package.json)
[![Chromium Features](https://img.shields.io/badge/Browser-Chromium%20recommended-1f6feb?logo=googlechrome&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)

**Performance**  
[![Bundle Gzip](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Fbundle-gzip.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)
[![First Render](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Ffirst-render.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)
[![View Switch](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Fview-switch.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)
[![Lighthouse Mobile](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Flighthouse-mobile.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)
[![Lighthouse Desktop](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Flighthouse-desktop.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)
[![Long Tasks](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcorderro-artz%2Fkata%2Fmain%2Freports%2Fperformance%2Fbadges%2Flong-tasks.json)](https://github.com/corderro-artz/kata/blob/main/reports/performance/latest.md)

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Performance](#performance)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Links](#links)
- [Contributing](#contributing)

## Overview

Kata parses, visualizes, diffs, and exports structured text entirely in-browser. The application is built around Web Workers, virtualized rendering, and progressive file handling so that large documents remain responsive without requiring a backend service.

### Capabilities

| Capability | Details |
| --- | --- |
| Input formats | JSON, YAML, TOML, Markdown, INI, and plain text |
| Export formats | JSON, YAML, TOML, Markdown, INI, XAML, and plain text |
| Views | Tree, Raw, and Diff |
| Local file workflows | Manual file mode and workspace folder mode |
| Search and analysis | Indexed search, node references, and diff inspection |
| Runtime model | Dedicated parse and export workers |
| App shell | Installable PWA with offline caching |

## Requirements

Use the project with the runtime and platform expectations below.

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | 20+ | Required for local development and builds |
| npm | 10+ | Used by the existing scripts and workflows |
| Browser | Chromium-based recommended | Full workspace file features depend on the File System Access API |

### Dependencies

| Category | Packages |
| --- | --- |
| UI | `preact`, `@preact/signals` |
| Parsing and formats | `yaml`, `smol-toml`, `ini`, `micromark` |
| Build | `vite`, `@preact/preset-vite`, `typescript` |
| PWA | `vite-plugin-pwa` |
| Performance tooling | `lighthouse`, `chrome-launcher`, `chrome-remote-interface` |

## Installation

```bash
npm install
```

## Quick Start

Start the local development server:

```bash
npm run dev
```

Common follow-up workflows:

```bash
npm run build
npm run preview
npm run check
npm run perf:report
```

## Architecture

Kata follows a worker-first architecture with a thin Preact UI layer, virtualized rendering, and base-aware PWA configuration for local and GitHub Pages deployments.

```text
Browser UI (Preact + Signals)
 |
 +-- Parse Worker   -> source detection, chunked parsing, document model
 +-- Export Worker  -> format conversion and export output
 |
 +-- Virtualized views (tree, raw, diff)
 +-- Search, indexing, and reference analysis
 +-- Local file + workspace adapters
 +-- PWA shell, cache, and install flow
```

### Design Principles

- Keep main-thread blocking low by pushing heavy parsing and export work into workers.
- Favor local-first workflows with no required backend after the app shell loads.
- Render only what is visible so large documents remain interactive.
- Keep deployment base paths configurable so the same app works locally and on GitHub Pages.

## Performance

Kata treats performance as a first-class project concern. The latest generated summary is available in [reports/performance/latest.md](reports/performance/latest.md).

| Budget | Status | Actual | Target |
| --- | --- | --- | --- |
| First render | PASS | 57.03 ms | <= 100 ms |
| View switch | PASS | 2.3 ms | <= 50 ms |
| Expand/collapse | PASS | 0.87 ms | <= 16 ms |
| Initial bundle gzip | PASS | 27,319 B | <= 51,200 B |
| Long tasks over 50 ms | PASS | 0 | 0 |
| Lighthouse mobile score | PASS | 100 | >= 90 |
| Lighthouse desktop score | PASS | 90 | >= 90 |

### Lighthouse Summary

| Metric | Mobile | Desktop |
| --- | --- | --- |
| FCP | 1316.4 ms | 1314.26 ms |
| LCP | 1578.06 ms | 1574.42 ms |
| TBT | 11.67 ms | 10.17 ms |
| CLS | 0 | 0 |

Detailed artifacts:

- [Latest Markdown summary](reports/performance/latest.md)
- [Latest JSON summary](reports/performance/latest.json)
- [Versioned report bundle](reports/performance/0.1.0-alpha/summary.md)

## Development

Use the existing npm scripts and GitHub workflows to keep the repo in a releasable state.

```bash
npm run dev
npm run check
npm run build
npm run perf:report
```

### Workflow Notes

- `npm run check` runs the TypeScript build checks.
- `npm run build` produces the production Vite bundle.
- `npm run perf:report` builds, previews, audits, and refreshes tracked performance artifacts.
- The CI workflow runs type-checking and build validation on pushes and pull requests.

## Deployment

Kata is deployed to GitHub Pages and uses a configurable app base so the same build can run from `/` locally and from a repository path in hosted environments.

- Environment: GitHub Pages
- Workflow: [Deploy Pages workflow](.github/workflows/deploy-pages.yml)
- Live URL: [Kata live site](https://corderro-artz.github.io/kata/)
- Performance automation: [Performance Report workflow](.github/workflows/perf-report.yml)

## Troubleshooting

Use these constraints when local behavior does not match the hosted app or when file access features appear limited.

> **Note:** Workspace folder mode depends on browser support for the File System Access API, so Chromium-based browsers provide the most complete experience.

> **Note:** The performance report workflow needs a Chrome executable. In CI this is provided by `browser-actions/setup-chrome`; locally you may need to set `CHROME_PATH`.

## Links

| Resource | Link |
| --- | --- |
| Repository | [github.com/corderro-artz/kata](https://github.com/corderro-artz/kata) |
| Live site | [corderro-artz.github.io/kata](https://corderro-artz.github.io/kata/) |
| Specification | [specification.md](specification.md) |
| Performance summary | [reports/performance/latest.md](reports/performance/latest.md) |
| CI workflow | [.github/workflows/ci.yml](.github/workflows/ci.yml) |
| Pages workflow | [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) |
| Performance workflow | [.github/workflows/perf-report.yml](.github/workflows/perf-report.yml) |
| Releases | [GitHub releases](https://github.com/corderro-artz/kata/releases) |
| Tags | [Git tags](https://github.com/corderro-artz/kata/tags) |
| License | [LICENSE](LICENSE) |
| Issues | [GitHub issues](https://github.com/corderro-artz/kata/issues) |
| Pull requests | [GitHub pull requests](https://github.com/corderro-artz/kata/pulls) |
| Actions | [GitHub Actions](https://github.com/corderro-artz/kata/actions) |
| Security | [GitHub security overview](https://github.com/corderro-artz/kata/security) |
| Vaporsoft | [vaporsoft.dev](https://www.vaporsoft.dev) |

## Contributing

1. Create a branch from `main` for the change.
2. Run `npm run check` and `npm run build` before opening a pull request.
3. Run `npm run perf:report` when the change affects runtime or bundle behavior.
4. Open a pull request with enough context to review product, architecture, and performance impact.

---

Copyright © 2026 Corderro Artz / Vaporsoft.
Vaporsoft | https://www.vaporsoft.dev
