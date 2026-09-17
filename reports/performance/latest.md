# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-09-17T01:09:08.519Z
- Commit: bdda1c4b534ce6815c6773ba110e815d411dd8fc
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.20.0
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Chrome: unknown
- Build duration: 6404.91 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 59.9 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 5.3 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.87 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28402 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.59 KB (87643 B)
- Initial gzip: 27.74 KB (28402 B)
- Total raw: 459.48 KB (470510 B)
- Total gzip: 193.08 KB (197716 B)

## Lighthouse

### Mobile

- Score: 99.33
- FCP: 1379.2 ms
- Speed Index: 1379.2 ms
- LCP: 1620.67 ms
- TBT: 18.83 ms
- CLS: 0
- Main-thread work: 2094.2 ms
- Script bootup: 1355.3 ms

### Desktop

- Score: 89
- FCP: 1371.62 ms
- Speed Index: 1371.62 ms
- LCP: 1636.74 ms
- TBT: 23.33 ms
- CLS: 0
- Main-thread work: 2065.78 ms
- Script bootup: 1346.99 ms

## App Interaction Metrics

- First render: 59.9 ms
- Parse worker time: 0.53 ms
- Parse node count: 82
- Max view switch: 5.3 ms
- Max tree toggle: 0.87 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 38.1 ms
- Load event: 55.67 ms
- JS heap used: 1880.38 KB (1925506 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1620.67 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 99.33 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | FAIL | 89 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
