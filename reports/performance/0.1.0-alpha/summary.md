# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-09-28T10:43:36.249Z
- Commit: a3db1f8a6365e34d2521f2fe0d13e44b12b69fad
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.21.0
- Platform: linux x64
- CPU: Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz
- Chrome: unknown
- Build duration: 6059.37 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 59.13 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 4.63 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.93 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28402 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.59 KB (87643 B)
- Initial gzip: 27.74 KB (28402 B)
- Total raw: 459.48 KB (470507 B)
- Total gzip: 193.09 KB (197722 B)

## Lighthouse

### Mobile

- Score: 99.33
- FCP: 1368.36 ms
- Speed Index: 1368.36 ms
- LCP: 1599.81 ms
- TBT: 9.5 ms
- CLS: 0
- Main-thread work: 1971.01 ms
- Script bootup: 1336.07 ms

### Desktop

- Score: 89
- FCP: 1366.23 ms
- Speed Index: 1366.23 ms
- LCP: 1624.61 ms
- TBT: 18.67 ms
- CLS: 0
- Main-thread work: 1982 ms
- Script bootup: 1347.08 ms

## App Interaction Metrics

- First render: 59.13 ms
- Parse worker time: 0.43 ms
- Parse node count: 82
- Max view switch: 4.63 ms
- Max tree toggle: 0.93 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 37.23 ms
- Load event: 55.03 ms
- JS heap used: 2607.94 KB (2670528 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1599.81 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
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
