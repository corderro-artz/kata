# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-04-06T05:55:14.939Z
- Commit: a752675f5313205284b07efdef8761e99285e0d0
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.14.1
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Chrome: unknown
- Build duration: 5416.85 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 53.83 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 4.1 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.9 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 26.68 KB (27319 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 81.93 KB (83899 B)
- Initial gzip: 26.68 KB (27319 B)
- Total raw: 470.21 KB (481496 B)
- Total gzip: 191.59 KB (196187 B)

## Lighthouse

### Mobile

- Score: 100
- FCP: 1322.32 ms
- Speed Index: 1322.32 ms
- LCP: 1534.32 ms
- TBT: 4.33 ms
- CLS: 0
- Main-thread work: 574.87 ms
- Script bootup: 64.19 ms

### Desktop

- Score: 90.67
- FCP: 1352.58 ms
- Speed Index: 1352.58 ms
- LCP: 1487.18 ms
- TBT: 4.67 ms
- CLS: 0
- Main-thread work: 3445.73 ms
- Script bootup: 2629.01 ms

## App Interaction Metrics

- First render: 53.83 ms
- Parse worker time: 0.53 ms
- Parse node count: 82
- Max view switch: 4.1 ms
- Max tree toggle: 0.9 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 35.6 ms
- Load event: 51.83 ms
- JS heap used: 1986.17 KB (2033835 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1534.32 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 100 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | PASS | 90.67 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
