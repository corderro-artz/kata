# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-09-16T19:42:54.728Z
- Commit: e67cfc4b226887132e70da0a5dbe7d30dd7dad21
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.20.0
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Chrome: unknown
- Build duration: 5864.54 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 56.07 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 5.2 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.83 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28402 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.59 KB (87643 B)
- Initial gzip: 27.74 KB (28402 B)
- Total raw: 459.49 KB (470513 B)
- Total gzip: 193.09 KB (197725 B)

## Lighthouse

### Mobile

- Score: 99.67
- FCP: 1361.72 ms
- Speed Index: 1361.72 ms
- LCP: 1624.39 ms
- TBT: 22.67 ms
- CLS: 0
- Main-thread work: 2022.99 ms
- Script bootup: 1345.99 ms

### Desktop

- Score: 89
- FCP: 1364.17 ms
- Speed Index: 1364.17 ms
- LCP: 1627.54 ms
- TBT: 21 ms
- CLS: 0
- Main-thread work: 2014.69 ms
- Script bootup: 1347.66 ms

## App Interaction Metrics

- First render: 56.07 ms
- Parse worker time: 0.5 ms
- Parse node count: 82
- Max view switch: 5.2 ms
- Max tree toggle: 0.83 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 37.67 ms
- Load event: 53.03 ms
- JS heap used: 1879.11 KB (1924208 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1624.39 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 99.67 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | FAIL | 89 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
