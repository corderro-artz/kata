# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-03-30T13:28:52.914Z
- Commit: 58f35404150b81715ded974e628214f02c4857b1
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.14.0
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Chrome: unknown
- Build duration: 5434.15 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 58.47 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 4.23 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 1.03 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 26.68 KB (27319 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 81.93 KB (83899 B)
- Initial gzip: 26.68 KB (27319 B)
- Total raw: 470.20 KB (481487 B)
- Total gzip: 191.58 KB (196183 B)

## Lighthouse

### Mobile

- Score: 100
- FCP: 1331.79 ms
- Speed Index: 1331.79 ms
- LCP: 1455.62 ms
- TBT: 2.67 ms
- CLS: 0
- Main-thread work: 558.53 ms
- Script bootup: 57.9 ms

### Desktop

- Score: 90.33
- FCP: 1323.08 ms
- Speed Index: 1323.08 ms
- LCP: 1539.24 ms
- TBT: 4.67 ms
- CLS: 0
- Main-thread work: 3388.96 ms
- Script bootup: 2632.94 ms

## App Interaction Metrics

- First render: 58.47 ms
- Parse worker time: 0.5 ms
- Parse node count: 82
- Max view switch: 4.23 ms
- Max tree toggle: 1.03 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 33.87 ms
- Load event: 50.5 ms
- JS heap used: 1856.18 KB (1900724 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1455.62 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
| Cumulative Layout Shift | PASS | 0 | 0.1 | web.dev defines good CLS as 0.1 or less at the 75th percentile. |

- web.dev defines good INP as 200ms or less at the 75th percentile.
- This release report is lab-based; INP needs RUM. TBT is reported as the lab proxy per web.dev guidance.

## Chrome Lighthouse Performance Score

Source: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Mobile Lighthouse score | PASS | 100 | 90 | Chrome Docs classifies 90-100 as Good. |
| Desktop Lighthouse score | PASS | 90.33 | 90 | Chrome Docs classifies 90-100 as Good. |

- Lighthouse 10 weights: FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%.
- Scores fluctuate with device conditions and test variability; use repeated runs for trend analysis.
