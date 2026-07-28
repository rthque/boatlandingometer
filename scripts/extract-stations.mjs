// Extracts the two tide stations this app needs from @neaps/tide-database
// into src/lib/stations.json.
//
// Why: the full database is ~24 MB (every station on Earth). We only ever
// predict for Dieppe (the site) and Brest (the reference for French tidal
// coefficients), so we bake those two in and keep @neaps/tide-database as a
// dev-only dependency. The runtime then needs @neaps/tide-predictor alone
// (~95 KB), which is what makes a static client-side build viable.
//
// Re-run with `npm run stations` after bumping @neaps/tide-database.

import { writeFileSync } from "node:fs";
import { nearest } from "@neaps/tide-database";

const SITES = {
  dieppe: { latitude: 49.9253, longitude: 1.0758 },
  brest: { latitude: 48.3828, longitude: -4.4953 },
};

const out = {};

for (const [key, position] of Object.entries(SITES)) {
  const found = nearest(position);
  if (!found) throw new Error(`No station found near ${key}`);
  const [station, distance] = found;

  out[key] = station;
  console.log(
    `${key.padEnd(7)} -> ${station.name} (${station.id}) ` +
      `${distance.toFixed(1)} km, ${station.harmonic_constituents.length} constituents, ` +
      `datum ${station.chart_datum}`,
  );
}

const target = new URL("../src/lib/stations.json", import.meta.url);
writeFileSync(target, JSON.stringify(out, null, 2) + "\n");
console.log(`\nWrote ${target.pathname}`);
