# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-10-12T11:46:40.618Z
- Commit: b0e2f9bfca29798b3833fbb28ec29d3768898483
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.21.0
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Chrome: unknown
- Build duration: 6076.29 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 61.07 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 4.67 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.93 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28402 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.59 KB (87643 B)
- Initial gzip: 27.74 KB (28402 B)
- Total raw: 459.48 KB (470506 B)
- Total gzip: 193.08 KB (197713 B)

## Lighthouse

### Mobile

- Score: 99
- FCP: 1382.53 ms
- Speed Index: 1382.53 ms
- LCP: 1607.89 ms
- TBT: 16.67 ms
- CLS: 0
- Main-thread work: 1982.62 ms
- Script bootup: 1342.72 ms

### Desktop

- Score: 89
- FCP: 1362.52 ms
- Speed Index: 1362.52 ms
- LCP: 1623.69 ms
- TBT: 17 ms
- CLS: 0
- Main-thread work: 2012.05 ms
- Script bootup: 1345.04 ms

## App Interaction Metrics

- First render: 61.07 ms
- Parse worker time: 0.57 ms
- Parse node count: 82
- Max view switch: 4.67 ms
- Max tree toggle: 0.93 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 35.63 ms
- Load event: 51.83 ms
- JS heap used: 1750.62 KB (1792633 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1607.89 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
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
