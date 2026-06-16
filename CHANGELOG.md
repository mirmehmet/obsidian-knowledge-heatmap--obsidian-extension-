# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-16

### Added
- **Interactive MiniMap:** Canvas-based overview of the network graph with viewport tracing and click-to-pan.
- **Time Travel Snapshots:** Capture and save heat map state history to review vault state over time.
- **Weekly Digest Notifications:** Smart notification triggers summarizing note temperature shifts.
- **Clickable Tooltips:** Tooltip titles are now clickable, opening files directly in the workspace.
- **Custom Preset Profiles:** Save and load custom weighting profiles right from the sidebar.
- **Ego-Graph Focus Mode:** Right-click nodes to isolate them and focus on immediate connections.
- **Built-in Palettes:** 6 beautiful ready-made palettes (Amber, Ocean, Forest, Sunset, Neon, Monochrome) and custom selection.
- **What's New Modal:** Automatic changelog presentation on new major version load.
- **Performance Optimizations:** Incremental analysis, staggered animations, and batch DOM insertion with count transition in StatsPanel.
- **Robust Verification:** Added 13 new unit tests covering logger, export, digest, history, and trend calculations (total 51 tests).

### Fixed
- Hex color validation regex in custom color selection.
- i18n bugs in context menus and graph reloader.
- Type-safe guards, timer types, and explicit type imports.

## [0.1.0] - 2026-06-13

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
