# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-09-16T19:53:37.450Z
- Commit: a4fbb3ea084deec3873619d7428c595fcf4d66c2
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.20.0
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Chrome: unknown
- Build duration: 6316.16 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 58.13 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 5.07 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 1.03 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28402 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.59 KB (87643 B)
- Initial gzip: 27.74 KB (28402 B)
- Total raw: 459.48 KB (470508 B)
- Total gzip: 193.08 KB (197719 B)

## Lighthouse

### Mobile

- Score: 99
- FCP: 1366.3 ms
- Speed Index: 1366.3 ms
- LCP: 1630.23 ms
- TBT: 21 ms
- CLS: 0
- Main-thread work: 2064.57 ms
- Script bootup: 1343.89 ms

### Desktop

- Score: 89
- FCP: 1368.72 ms
- Speed Index: 1368.72 ms
- LCP: 1635.67 ms
- TBT: 31.67 ms
- CLS: 0
- Main-thread work: 2066.55 ms
- Script bootup: 1356.2 ms

## App Interaction Metrics

- First render: 58.13 ms
- Parse worker time: 0.57 ms
- Parse node count: 82
- Max view switch: 5.07 ms
- Max tree toggle: 1.03 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 40.2 ms
- Load event: 57.83 ms
- JS heap used: 1736.84 KB (1778520 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1630.23 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
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
