# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-03-30T11:07:45.017Z
- Commit: 9062c20d43c066ec57ec4d20446de2126c0ecdb7
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.14.0
- Platform: win32 x64
- CPU: AMD Ryzen 9 3950X 16-Core Processor            
- Chrome: unknown
- Build duration: 5019.72 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 59.37 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 2.37 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.87 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 26.68 KB (27319 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 81.93 KB (83899 B)
- Initial gzip: 26.68 KB (27319 B)
- Total raw: 470.25 KB (481537 B)
- Total gzip: 191.61 KB (196205 B)

## Lighthouse

### Mobile

- Score: 100
- FCP: 1316.71 ms
- Speed Index: 1316.71 ms
- LCP: 1579.54 ms
- TBT: 12.83 ms
- CLS: 0
- Main-thread work: 406.48 ms
- Script bootup: 32.53 ms

### Desktop

- Score: 90
- FCP: 1314.07 ms
- Speed Index: 1314.07 ms
- LCP: 1574.07 ms
- TBT: 10 ms
- CLS: 0
- Main-thread work: 389.8 ms
- Script bootup: 34.04 ms

## App Interaction Metrics

- First render: 59.37 ms
- Parse worker time: 0.4 ms
- Parse node count: 82
- Max view switch: 2.37 ms
- Max tree toggle: 0.87 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 19.2 ms
- Load event: 32.5 ms
- JS heap used: 1852.82 KB (1897291 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1579.54 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
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
