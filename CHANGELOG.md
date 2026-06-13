# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-13

### Added
- **Core Engine:**
  - `NoteAnalyzer` to scan vaults chunk-by-chunk (50 files per chunk) to avoid UI freezing.
  - `ScoreCalculator` supporting 5 weighted criteria: Recency, Link Density, Visit Frequency, Orphan Penalty, and Content Length.
  - `ColorMapper` mapping scores to 5 distinct temperature levels (Frozen, Cold, Warm, Hot, Burning).
  - `BucketSorter` grouping note paths based on heat buckets.
- **Storage & Caching:**
  - `VisitTracker` recording file-open workspace events with 100ms debouncing to protect disk I/O.
  - `HeatCache` with TTL support (default 30 minutes) to cache scores.
- **Graph View Integration:**
  - `GraphJsonManager` managing read, write, backups, and restores of `.obsidian/graph.json`.
  - `GraphReloader` refreshing open graph view leaves automatically.
  - `HeatControlButton` dynamically injecting control buttons (🔥 / ❄️) into active graph leaf settings panels.
- **D3.js Custom Heat View:**
  - Bağımsız interactive 2-column graph view tab containing D3 force-directed simulations.
  - Glowing SVG effects matching note temperatures.
  - Contextual hover tooltips showing note stats, and click handlers opening notes directly.
  - `StatsPanel` and `HeatLegend` components displaying vault analytics and scale references.
- **Polish & Localization:**
  - Full Turkish and English i18n localization support.
  - Modern styling using native Obsidian design tokens for dark/light mode compatibility.
  - High coverage unit test suite (30 test cases) and performance integration benchmark tests.
