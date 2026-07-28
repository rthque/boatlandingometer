# Boatlandingometer

Tide graph for Dieppe drawn against the jacket structure and boat landing of an
offshore wind turbine, so you can read at a glance whether a crew transfer is
feasible at a given time.

**Live:** https://rthque.github.io/boatlandingometer/

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173/boatlandingometer/

## Building

```bash
npm run build    # type-check + build into dist/
npm run preview  # serve the result
```

## How the tides are computed

Everything runs in the browser. Harmonic constituents for two stations — Dieppe
(the site) and Brest (the reference for French tidal coefficients) — are baked
into `src/lib/stations.json`, generated from
[`@neaps/tide-database`](https://openwaters.io/tides/neaps) by:

```bash
npm run stations
```

Only `@neaps/tide-predictor` (~95 KB) is a runtime dependency; the ~24 MB global
station database stays in devDependencies.

## Deployment

Pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`. No external service, no deploy credentials.
