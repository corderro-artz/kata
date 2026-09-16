# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-09-16T19:30:34.553Z
- Commit: a197f00f14fdc004bb2fbf7f47f177bd4a40d85e
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.20.0
- Platform: linux x64
- CPU: INTEL(R) XEON(R) PLATINUM 8573C
- Chrome: unknown
- Build duration: 5527.21 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 53.43 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 4 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.8 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28407 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.61 KB (87667 B)
- Initial gzip: 27.74 KB (28407 B)
- Total raw: 474.35 KB (485732 B)
- Total gzip: 194.91 KB (199592 B)

## Lighthouse

### Mobile

- Score: 99.33
- FCP: 1375.18 ms
- Speed Index: 1375.18 ms
- LCP: 1607.09 ms
- TBT: 7.67 ms
- CLS: 0
- Main-thread work: 1960.42 ms
- Script bootup: 1333.95 ms

### Desktop

- Score: 89.33
- FCP: 1375.51 ms
- Speed Index: 1375.51 ms
- LCP: 1612.69 ms
- TBT: 17.33 ms
- CLS: 0
- Main-thread work: 1973.12 ms
- Script bootup: 1337.04 ms

## App Interaction Metrics

- First render: 53.43 ms
- Parse worker time: 0.47 ms
- Parse node count: 82
- Max view switch: 4 ms
- Max tree toggle: 0.8 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 34.4 ms
- Load event: 48.53 ms
- JS heap used: 2603.35 KB (2665827 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1607.09 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 99.33 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | FAIL | 89.33 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
