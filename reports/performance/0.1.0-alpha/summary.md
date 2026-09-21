# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-09-21T09:46:59.839Z
- Commit: 0fc01120390166da7fb31350ee424b38a51bf02a
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.20.0
- Platform: linux x64
- CPU: INTEL(R) XEON(R) PLATINUM 8573C
- Chrome: unknown
- Build duration: 4497.9 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 52.73 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 3.8 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.6 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28402 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.59 KB (87643 B)
- Initial gzip: 27.74 KB (28402 B)
- Total raw: 459.47 KB (470498 B)
- Total gzip: 193.09 KB (197721 B)

## Lighthouse

### Mobile

- Score: 99.33
- FCP: 1356.82 ms
- Speed Index: 1356.82 ms
- LCP: 1557.48 ms
- TBT: 1.33 ms
- CLS: 0
- Main-thread work: 448.24 ms
- Script bootup: 56.35 ms

### Desktop

- Score: 90
- FCP: 1362.02 ms
- Speed Index: 1362.02 ms
- LCP: 1591.16 ms
- TBT: 3.5 ms
- CLS: 0
- Main-thread work: 1906.02 ms
- Script bootup: 1326.87 ms

## App Interaction Metrics

- First render: 52.73 ms
- Parse worker time: 0.33 ms
- Parse node count: 82
- Max view switch: 3.8 ms
- Max tree toggle: 0.6 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 29.6 ms
- Load event: 41.83 ms
- JS heap used: 1875.18 KB (1920181 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1557.48 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 99.33 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | PASS | 90 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
