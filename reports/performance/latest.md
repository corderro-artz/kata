# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-09-17T00:29:21.029Z
- Commit: 7c5747dcfb470c194247f07ecb8b152dc716f14a
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.20.0
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Chrome: unknown
- Build duration: 5858.65 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 54.5 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 4.37 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.83 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28402 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.59 KB (87643 B)
- Initial gzip: 27.74 KB (28402 B)
- Total raw: 459.48 KB (470504 B)
- Total gzip: 193.08 KB (197713 B)

## Lighthouse

### Mobile

- Score: 99.67
- FCP: 1359.21 ms
- Speed Index: 1359.21 ms
- LCP: 1621.53 ms
- TBT: 22.33 ms
- CLS: 0
- Main-thread work: 1997.76 ms
- Script bootup: 1338.95 ms

### Desktop

- Score: 89
- FCP: 1376.86 ms
- Speed Index: 1376.86 ms
- LCP: 1615.63 ms
- TBT: 21.67 ms
- CLS: 0
- Main-thread work: 2009.92 ms
- Script bootup: 1339.51 ms

## App Interaction Metrics

- First render: 54.5 ms
- Parse worker time: 0.43 ms
- Parse node count: 82
- Max view switch: 4.37 ms
- Max tree toggle: 0.83 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 38.47 ms
- Load event: 52.77 ms
- JS heap used: 1927.98 KB (1974251 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1621.53 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
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
