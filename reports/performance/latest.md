# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-03-27T08:47:40.357Z
- Commit: unavailable
- Branch: unavailable

## Environment

- Node: v24.14.0
- Platform: win32 x64
- CPU: AMD Ryzen 9 3950X 16-Core Processor            
- Chrome: unknown
- Build duration: 6541.06 ms

## Kata Spec Budgets

Source: specification.md

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | FAIL | 158 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 4.8 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 15.8 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | FAIL | 84.11 KB (86128 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 204.37 KB (209274 B)
- Initial gzip: 84.11 KB (86128 B)
- Total raw: 3930.40 KB (4024732 B)
- Total gzip: 3514.43 KB (3598781 B)

## Lighthouse

### Mobile

- Score: 98
- FCP: 1807.3 ms
- Speed Index: 1807.3 ms
- LCP: 1957.3 ms
- TBT: 0 ms
- CLS: 0
- Main-thread work: 602.39 ms
- Script bootup: 122 ms

### Desktop

- Score: 81
- FCP: 1807.02 ms
- Speed Index: 1807.02 ms
- LCP: 2107.02 ms
- TBT: 0 ms
- CLS: 0.04
- Main-thread work: 891.14 ms
- Script bootup: 153.64 ms

## App Interaction Metrics

- First render: 158 ms
- Parse worker time: 7.3 ms
- Parse node count: 2492
- Max view switch: 4.8 ms
- Max tree toggle: 15.8 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 18.4 ms
- Load event: 60.6 ms
- JS heap used: 2835.07 KB (2903115 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1957.3 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 98 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | FAIL | 81 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
