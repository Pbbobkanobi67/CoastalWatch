# CoastalWatch — Claude Code Enhancement Prompt

Use this file to give Claude Code context when you want to add features or fix issues.

---

## Project Summary

CoastalWatch is a single-file HTML/JS app (`index.html`) that displays synchronized dual-panel satellite maps for comparing coastal shoreline changes over decades. It uses:

- **Leaflet.js** for interactive maps
- **NASA GIBS WMTS** for Landsat WELD (1984–2001, 30m) and MODIS (2003–present, 250m)
- **EOX Sentinel-2 Cloudless WMTS** (2018–2024, 10m)
- **html2canvas** (CDN) for PNG export
- No build system — plain HTML/CSS/JS, no npm required to run

The entire app is self-contained in `index.html`. No backend, no API keys required.

---

## Architecture

```
index.html (~990 lines)
├── <head>
│   ├── Leaflet CSS/JS (CDN)
│   ├── html2canvas v1.4.1 (CDN) — for Export PNG
│   └── Google Fonts (Syne Mono, Barlow)
├── <style>          — all CSS (lines 11–239: variables, layout, Leaflet overrides, tour, timelapse, blend, water index)
├── <body>           — HTML (lines 241–417)
│   ├── header       — brand, location dropdown (26 sites), Help button, coords
│   ├── timeline-bar — past/present epoch strips with year pills + month picker
│   ├── maps-wrap    — dual synchronized Leaflet map panels
│   ├── tourOverlay  — guided tour balloon system (6 steps)
│   └── toolbar      — Measure, Shoreline, Clear, Timelapse, Blend, Export, Water Index, Legend
└── <script>         — JS (lines 419–994)
    ├── EPOCHS[]       — 26 satellite source definitions (Landsat, MODIS, Sentinel-2)
    ├── buildStrips()  — generates year pill buttons from EPOCHS
    ├── selectEpoch()  — handles pill clicks, shows/hides month picker
    ├── applyEpoch()   — loads tile layer onto map1/map2 + refreshes blend/NDWI overlays
    ├── map1/map2      — Leaflet instances, synced via 'move' events
    ├── Tools          — activateTool(), handleClick(), haversine(), recalcChange()
    ├── Help/Tour      — startTour(), closeTour(), tourNav(), showTourStep()
    ├── Timelapse      — tlPlay(), tlPause(), tlStop(), tlStep(), tlResume()
    ├── Blend          — toggleBlend(), applyBlendOverlay(), removeBlendOverlay(), applyBlend()
    ├── Export         — exportPNG() via html2canvas
    ├── Water Index    — toggleNdwi(), applyNdwi(), removeNdwi() (MODIS NDVI proxy)
    └── Init           — buildStrips(), auto-selects 1990 vs 2024, auto-tour for first visit
```

---

## Features

### Core (v1.0)
- Dual synchronized satellite map panels (Leaflet.js)
- 3 satellite sources: Landsat WELD 30m, MODIS Terra 250m, Sentinel-2 10m
- Timeline strips with clickable year pills per panel
- 26 preset coastline locations across 5 categories
- Measurement tool (distance via haversine)
- Shoreline change tool (displacement + annual rate)
- Coordinate display, source badges, resolution badges

### v2.0 Features (implemented)
1. **Arctic Locations** — 10 permafrost erosion hotspots in `<optgroup>` (Drew Point, Barter Island, Herschel Island, Pelly Island, Tuktoyaktuk, Muostakh Island, Cape Espenberg, Utqiagvik, Adventfjorden, Mackenzie Delta)
2. **Guided Help Tour** — 6-step popup balloon walkthrough (location selector, past/present timelines, both maps, toolbar). Auto-shows for first-time visitors via `localStorage` key `cw_toured`.
3. **Timelapse Animation** — Play/pause/resume/stop through all 26 epochs on left map, 1s/frame. Pulsing glow CSS animation on active pill. Progress counter display.
4. **Opacity Blend** — Toggle overlays present epoch tiles on map1 with 0–100% opacity slider. Auto-refreshes when present epoch changes via `applyEpoch()` hook.
5. **Export PNG** — html2canvas captures `.maps-wrap` at 2x scale, downloads as `coastalwatch-{location}-{past}-vs-{present}.png`. Button shows loading state during export.
6. **Water Index Toggle** — MODIS NDVI overlay (opacity 0.55) on both maps as NDWI proxy. Only active for epochs 2003+. Badge note: "NDVI PROXY — MODIS ERA ONLY". Auto-refreshes via `applyEpoch()` hook.

---

## Location Categories (26 total)

| Category | Count | Examples |
|----------|-------|---------|
| At-Risk Atolls | 3 | Malé, Funafuti, South Tarawa |
| Barrier Beaches | 4 | Miami Beach, Narrabeen, North Sea, Tokyo Bay |
| Deltas | 4 | Ganges-Brahmaputra, Mississippi, Yangtze, Nile |
| Subsiding Cities | 3 | Venice, Lagos, Jakarta |
| Arctic Permafrost Erosion | 10 | Drew Point, Tuktoyaktuk, Herschel Island, Utqiagvik |

---

## Key Technical Notes

- **Only 1 existing function was modified for v2.0**: `applyEpoch()` has 2 hook lines at its end — one refreshes blend overlay when present epoch changes, one refreshes NDWI when any epoch changes
- **NDWI does not exist in GIBS** — uses `MODIS_Terra_NDVI_8Day` as water detection proxy
- **NDVI tile URL**: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/{yr}-{mo}-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`
- **html2canvas CDN**: `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js`
- **CORS limitation**: Export PNG may render cross-origin tiles as blank (GIBS supports CORS; EOX may not)
- **Blend** uses Leaflet tile overlay on map1 (not CSS clip-path) to avoid layout risk
- **Tour** uses pure CSS/JS (no library), localStorage flag `cw_toured` for first-visit detection
- **CSS variables**: `--ink`, `--teal`, `--gold`, `--lime`, `--blue`, `--txt`, `--muted`, `--border`
- **Fonts**: Syne Mono (monospace labels), Barlow (body text)

---

## Satellite Source Details

| Type | Layer ID | Years | Max Zoom | Needs Month |
|------|----------|-------|----------|-------------|
| lsat | Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual | 1984-2001 (9 years) | 12 | No |
| mod  | MODIS_Terra_CorrectedReflectance_TrueColor | 2003-2017 | 9 | Yes |
| s2   | EOX s2cloudless-{year}_3857 | 2018-2024 | 14 | No |
