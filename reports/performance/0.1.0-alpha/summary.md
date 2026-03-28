# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-03-28T06:32:47.119Z
- Commit: 3e3bf0dc5c490a2609ceaeccacc8b7dfa25e15d3
- Branch: main

## Environment

- Node: v24.14.0
- Platform: win32 x64
- CPU: AMD Ryzen 9 3950X 16-Core Processor            
- Chrome: unknown
- Build duration: 4740.47 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 62.8 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 2.5 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.9 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 24.09 KB (24672 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 72.68 KB (74421 B)
- Initial gzip: 24.09 KB (24672 B)
- Total raw: 548.45 KB (561610 B)
- Total gzip: 264.82 KB (271177 B)

## Lighthouse

### Mobile

- Score: 99
- FCP: 1390.25 ms
- Speed Index: 1390.25 ms
- LCP: 1573.25 ms
- TBT: 6.79 ms
- CLS: 0
- Main-thread work: 389.46 ms
- Script bootup: 31.38 ms

### Desktop

- Score: 90
- FCP: 1315 ms
- Speed Index: 1315 ms
- LCP: 1575 ms
- TBT: 10 ms
- CLS: 0
- Main-thread work: 388.7 ms
- Script bootup: 30.28 ms

## App Interaction Metrics

- First render: 62.8 ms
- Parse worker time: 1.8 ms
- Parse node count: 531
- Max view switch: 2.5 ms
- Max tree toggle: 0.9 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 32.6 ms
- Load event: 79.5 ms
- JS heap used: 1900.59 KB (1946201 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1573.25 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 99 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | PASS | 90 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
