# Kata

Local-first structured text parser and visualizer.
Installable PWA that parses, inspects, and exports entirely in-browser.

## Highlights

- 6 input formats: JSON, YAML, TOML, Markdown, INI, plain text
- 4 export formats: JSON, YAML, TOML, Markdown
- 3 virtualized views: tree, raw, cards
- Worker-first runtime for parse and export
- Workspace mode via File System Access API
- Offline support with service worker precache

## Quick Start

1. npm install
2. npm run dev

Build and preview:

1. npm run build
2. npm run preview

## Performance Snapshot

From the latest dry run in [reports/performance/latest.md](reports/performance/latest.md):

- First render: 61.77 ms
- Max view switch: 2.23 ms
- Max tree toggle: 0.8 ms
- Long tasks over 50 ms: 0
- Initial bundle gzip: 25,365 B
- Lighthouse mobile: 100 (FCP 1314.39 ms, LCP 1573.39 ms, TBT 9 ms)
- Lighthouse desktop: 90 (FCP 1312.85 ms, LCP 1571.35 ms, TBT 8.5 ms)

## Scripts

- npm run dev: start dev server
- npm run build: type-check and production build
- npm run check: type-check only
- npm run preview: serve production build
- npm run perf:report: run Lighthouse and app metrics, write reports

## Deployment

GitHub Pages deployment is automated via workflow in [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml).

Expected Pages URL:
https://corderro-artz.github.io/kata/

## Docs

- Product constraints: [specification.md](specification.md)
- Session notes: [SESSION_SUMMARY.md](SESSION_SUMMARY.md)

## License

[MIT](LICENSE) © 2026 Corderro Artz / Vaporsoft
