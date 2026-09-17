# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-09-17T02:11:32.313Z
- Commit: 566159eb50d7c04016fc94a25232f74bd68f2670
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.20.0
- Platform: linux x64
- CPU: INTEL(R) XEON(R) PLATINUM 8573C
- Chrome: unknown
- Build duration: 4378.5 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 50.9 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 3.33 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 0.7 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 27.74 KB (28402 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 85.59 KB (87643 B)
- Initial gzip: 27.74 KB (28402 B)
- Total raw: 459.48 KB (470507 B)
- Total gzip: 193.08 KB (197717 B)

## Lighthouse

### Mobile

- Score: 99
- FCP: 1384.18 ms
- Speed Index: 1384.18 ms
- LCP: 1560.85 ms
- TBT: 2 ms
- CLS: 0
- Main-thread work: 445.55 ms
- Script bootup: 56.82 ms

### Desktop

- Score: 90
- FCP: 1372.72 ms
- Speed Index: 1372.72 ms
- LCP: 1576.14 ms
- TBT: 3 ms
- CLS: 0
- Main-thread work: 1833.01 ms
- Script bootup: 1327.7 ms

## App Interaction Metrics

- First render: 50.9 ms
- Parse worker time: 0.3 ms
- Parse node count: 82
- Max view switch: 3.33 ms
- Max tree toggle: 0.7 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 29.03 ms
- Load event: 42.5 ms
- JS heap used: 1673.09 KB (1713246 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1560.85 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
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
