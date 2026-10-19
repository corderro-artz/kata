# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-10-19T09:44:38.480Z
- Commit: 39d897383447e8b87e9b1b3f22e13b118901e606
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.21.0
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Chrome: unknown
- Build duration: 6042.28 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 58.63 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 3.93 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.9 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28402 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.59 KB (87643 B)
- Initial gzip: 27.74 KB (28402 B)
- Total raw: 459.48 KB (470505 B)
- Total gzip: 193.08 KB (197712 B)

## Lighthouse

### Mobile

- Score: 99
- FCP: 1381.69 ms
- Speed Index: 1381.69 ms
- LCP: 1589.68 ms
- TBT: 11.17 ms
- CLS: 0
- Main-thread work: 1973.56 ms
- Script bootup: 1343.02 ms

### Desktop

- Score: 89
- FCP: 1362.65 ms
- Speed Index: 1362.65 ms
- LCP: 1623.18 ms
- TBT: 15.5 ms
- CLS: 0
- Main-thread work: 1984.88 ms
- Script bootup: 1340.59 ms

## App Interaction Metrics

- First render: 58.63 ms
- Parse worker time: 0.5 ms
- Parse node count: 82
- Max view switch: 3.93 ms
- Max tree toggle: 0.9 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 35.2 ms
- Load event: 49.93 ms
- JS heap used: 1749.27 KB (1791252 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1589.68 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 99 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | FAIL | 89 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
