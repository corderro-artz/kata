# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-10-05T11:17:56.478Z
- Commit: fc03c5c7b0ff583100ce60f14f233ae85b0506da
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.21.0
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Chrome: unknown
- Build duration: 6290.38 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 55.6 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 4.43 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.97 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28402 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.59 KB (87643 B)
- Initial gzip: 27.74 KB (28402 B)
- Total raw: 459.49 KB (470521 B)
- Total gzip: 193.10 KB (197731 B)

## Lighthouse

### Mobile

- Score: 99.33
- FCP: 1370.13 ms
- Speed Index: 1370.13 ms
- LCP: 1604.31 ms
- TBT: 14.33 ms
- CLS: 0
- Main-thread work: 1983.55 ms
- Script bootup: 1341.4 ms

### Desktop

- Score: 89
- FCP: 1372.09 ms
- Speed Index: 1372.09 ms
- LCP: 1633.84 ms
- TBT: 14.5 ms
- CLS: 0
- Main-thread work: 2028.3 ms
- Script bootup: 1355.71 ms

## App Interaction Metrics

- First render: 55.6 ms
- Parse worker time: 0.53 ms
- Parse node count: 82
- Max view switch: 4.43 ms
- Max tree toggle: 0.97 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 38.63 ms
- Load event: 54.3 ms
- JS heap used: 1671.89 KB (1712012 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1604.31 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
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
