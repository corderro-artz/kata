# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-09-16T19:19:54.046Z
- Commit: 2515520cbc8368b0316eb18e0ef3723789100101
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.20.0
- Platform: linux x64
- CPU: AMD EPYC 9V74 80-Core Processor
- Chrome: unknown
- Build duration: 5367.44 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 55.93 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 3.43 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.7 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 26.68 KB (27319 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 81.93 KB (83899 B)
- Initial gzip: 26.68 KB (27319 B)
- Total raw: 470.21 KB (481494 B)
- Total gzip: 191.59 KB (196186 B)

## Lighthouse

### Mobile

- Score: 100
- FCP: 1332.12 ms
- Speed Index: 1332.12 ms
- LCP: 1504.46 ms
- TBT: 6.83 ms
- CLS: 0
- Main-thread work: 1998.86 ms
- Script bootup: 1340.48 ms

### Desktop

- Score: 91
- FCP: 1337.8 ms
- Speed Index: 1337.8 ms
- LCP: 1467.97 ms
- TBT: 7.83 ms
- CLS: 0
- Main-thread work: 1996.27 ms
- Script bootup: 1331.67 ms

## App Interaction Metrics

- First render: 55.93 ms
- Parse worker time: 0.47 ms
- Parse node count: 82
- Max view switch: 3.43 ms
- Max tree toggle: 0.7 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 36.1 ms
- Load event: 52.27 ms
- JS heap used: 1858.64 KB (1903246 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1504.46 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 100 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | PASS | 91 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
