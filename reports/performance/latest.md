# Kata Performance Report

- Version: 0.1.0-alpha
- Generated: 2026-03-30T13:12:19.778Z
- Commit: 73c8efddad88309158f324ec76731ffc6f993fd0
- Branch: main
- Runs: 3 (3-run average)

## Environment

- Node: v24.14.0
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Chrome: unknown
- Build duration: 5243.56 ms

## Kata Spec Budgets

Source: internal

| Budget | Status | Actual | Target | Source |
| --- | --- | --- | --- | --- |
| First render | PASS | 54.57 ms | 100 ms | 6.1 Hard Constraints |
| View switch | PASS | 4.7 ms | 50 ms | 6.1 Hard Constraints |
| Expand/collapse | PASS | 1.07 ms | 16 ms | 6.1 Hard Constraints |
| Initial bundle gzip | PASS | 26.68 KB (27319 B) | 50.00 KB (51200 B) | 7. Bundle Strategy |
| Long tasks over 50ms | PASS | 0 count | 0 count | 6.1 Hard Constraints |

## Bundle

- Initial raw: 81.93 KB (83899 B)
- Initial gzip: 26.68 KB (27319 B)
- Total raw: 470.22 KB (481509 B)
- Total gzip: 191.59 KB (196188 B)

## Lighthouse

### Mobile

- Score: 100
- FCP: 1333.96 ms
- Speed Index: 1333.96 ms
- LCP: 1460.8 ms
- TBT: 4.5 ms
- CLS: 0
- Main-thread work: 568.46 ms
- Script bootup: 64.82 ms

### Desktop

- Score: 91
- FCP: 1335.72 ms
- Speed Index: 1335.72 ms
- LCP: 1463.55 ms
- TBT: 5 ms
- CLS: 0
- Main-thread work: 3411.82 ms
- Script bootup: 2629.87 ms

## App Interaction Metrics

- First render: 54.57 ms
- Parse worker time: 0.57 ms
- Parse node count: 82
- Max view switch: 4.7 ms
- Max tree toggle: 1.07 ms
- Long tasks: 0
- Max long task: 0 ms
- DOMContentLoaded: 35.97 ms
- Load event: 51.2 ms
- JS heap used: 1714.76 KB (1755919 B)

## Google Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Status | Actual | Target | Note |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint | PASS | 1460.8 ms | 2500 ms | web.dev defines good LCP as 2.5s or less at the 75th percentile. |
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
