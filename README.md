# CoastalWatch
### Multi-Decade Coastal Shoreline Change Analysis

Compare satellite imagery of the same coastline across ~40 years to visualize and measure shoreline changes driven by sea level rise, erosion, and land subsidence.

---

## Quick Start

```bash
# Option 1 — just open the file directly in your browser
open index.html

# Option 2 — serve locally (avoids any CORS edge cases)
npx serve . -p 3000
# then open http://localhost:3000
```

---

## Satellite Sources

| Color | Source | Resolution | Years | Notes |
|-------|--------|-----------|-------|-------|
| 🟡 Gold | NASA GIBS — Landsat WELD | **30m/px** | 1985, 1990, 1995, 2000, 2005, 2010 | Annual global composites, no auth needed |
| 🔵 Blue | NASA GIBS — MODIS Terra | **250m/px** | 2003–2017 (monthly) | Month-selectable, no auth needed |
| 🟢 Green | EOX — Sentinel-2 Cloudless | **10m/px** | 2018–2024 | Annual cloudless mosaics, non-commercial free |

All sources are **free with no API key or account required**.

---

## How to Use

1. **Pick a coastline** from the dropdown (or just pan/zoom the map to any coast)
2. **Select a Past Epoch** — click a year pill in the left timeline strip
3. **Select a Present Epoch** — click a year pill in the right timeline strip
4. Both maps sync automatically as you navigate
5. Use the measurement tools in the toolbar:

### 📏 Measure Distance
Click waypoints on either map to measure distances along a coastline feature.

### 🌊 Shoreline Δ (Change)
1. Click the **left (past) map** to drop a gold marker at the past shoreline position
2. Click the **right (present) map** to drop a green marker at the present shoreline position
3. The toolbar shows: total displacement, annualized rate (m/yr), and the time span

---

## Recommended Locations for Large Changes

| Location | Best Years | What to Look For |
|----------|-----------|-----------------|
| Mississippi Delta, Louisiana | 1990 vs 2024 | Dramatic land loss / delta shrinkage |
| Nile Delta, Egypt | 1990 vs 2024 | Coastal erosion at river mouth |
| Ganges-Brahmaputra Delta, Bangladesh | 1990 vs 2024 | Island emergence and disappearance |
| Funafuti Atoll, Tuvalu | 2000 vs 2024 | Island shoreline shifts |
| Jakarta Coast, Indonesia | 2000 vs 2024 | Land subsidence + reclamation |
| Venice Lagoon, Italy | 1990 vs 2024 | Lagoon margin changes |

---

## Zoom Level Guide

| Source | Max Zoom | Approx Scale |
|--------|---------|-------------|
| MODIS | 9 | ~150m features visible |
| Landsat WELD | 12 | ~30m features visible |
| Sentinel-2 | 14 | ~10m features visible |

The app automatically clamps zoom when switching to a lower-resolution source.

---

## Extending the App

### Add More Landsat Years
The NASA GIBS Landsat WELD layer accepts dates in `YYYY-07-01` format. The available epochs are centered on 1985, 1990, 1995, 2000, 2005, and 2010 — add more pills in the `EPOCHS` array in `index.html`.

### Add Sentinel Hub (date-specific Sentinel-2)
For specific-date Sentinel-2 imagery back to 2015:
1. Register free at [dataspace.copernicus.eu](https://dataspace.copernicus.eu)
2. Create a configuration instance in the Sentinel Hub Dashboard
3. Replace the EOX WMTS URL with:
   ```
   https://sh.dataspace.copernicus.eu/ogc/wms/<YOUR_INSTANCE_ID>
   ```

### Add Google Earth Engine
For full Landsat archive access (1972–present) at any date, integrate the GEE JavaScript API — requires a free GEE account.

---

## Data Attributions

- **Landsat WELD**: NASA GIBS / MEaSUREs GWELD project — [earthdata.nasa.gov](https://earthdata.nasa.gov)
- **MODIS Terra**: NASA GIBS — [earthdata.nasa.gov](https://earthdata.nasa.gov)  
- **Sentinel-2 Cloudless**: EOX IT Services GmbH — [s2maps.eu](https://s2maps.eu) (Contains modified Copernicus Sentinel data 2018–2024)
- **Map Library**: Leaflet.js — [leafletjs.com](https://leafletjs.com)
