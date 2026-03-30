# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-03-30T10:04:52.250Z
- Commit: 49a8f4b6f57efddb9970d818a83879f4184bf0d7
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.14.0
- Platform: win32 x64
- CPU: AMD Ryzen 9 3950X 16-Core Processor            
- Chrome: unknown
- Build duration: 4983.31 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 60.77 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 2.8 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.73 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 24.96 KB (25556 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 74.72 KB (76517 B)
- Initial gzip: 24.96 KB (25556 B)
- Total raw: 462.54 KB (473637 B)
- Total gzip: 189.73 KB (194288 B)

## Lighthouse

### Mobile

- Score: 100
- FCP: 1316.23 ms
- Speed Index: 1316.23 ms
- LCP: 1577.73 ms
- TBT: 11.5 ms
- CLS: 0
- Main-thread work: 408.51 ms
- Script bootup: 35.86 ms

### Desktop

- Score: 90
- FCP: 1315.04 ms
- Speed Index: 1315.04 ms
- LCP: 1575.04 ms
- TBT: 10 ms
- CLS: 0
- Main-thread work: 410.51 ms
- Script bootup: 36.71 ms

## App Interaction Metrics

- First render: 60.77 ms
- Parse worker time: 0.3 ms
- Parse node count: 82
- Max view switch: 2.8 ms
- Max tree toggle: 0.73 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 20.13 ms
- Load event: 36.13 ms
- JS heap used: 1697.34 KB (1738080 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1577.73 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 100 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | PASS | 90 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
