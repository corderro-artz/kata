# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-03-30T09:06:02.380Z
- Commit: 49cd7b5a6252a487fac14880a0837690425703a3
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.14.0
- Platform: win32 x64
- CPU: AMD Ryzen 9 3950X 16-Core Processor            
- Chrome: unknown
- Build duration: 4967.29 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 61.77 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 2.23 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.8 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 24.77 KB (25365 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 74.40 KB (76188 B)
- Initial gzip: 24.77 KB (25365 B)
- Total raw: 461.17 KB (472234 B)
- Total gzip: 189.19 KB (193732 B)

## Lighthouse

### Mobile

- Score: 100
- FCP: 1314.39 ms
- Speed Index: 1314.39 ms
- LCP: 1573.39 ms
- TBT: 9 ms
- CLS: 0
- Main-thread work: 396.37 ms
- Script bootup: 32.55 ms

### Desktop

- Score: 90
- FCP: 1312.85 ms
- Speed Index: 1312.85 ms
- LCP: 1571.35 ms
- TBT: 8.5 ms
- CLS: 0
- Main-thread work: 384.7 ms
- Script bootup: 32.05 ms

## App Interaction Metrics

- First render: 61.77 ms
- Parse worker time: 0.4 ms
- Parse node count: 82
- Max view switch: 2.23 ms
- Max tree toggle: 0.8 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 21.57 ms
- Load event: 40.77 ms
- JS heap used: 1689.09 KB (1729628 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1573.39 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
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
