// Regenerates every app icon from assets/icon-source.png.
//
//   npm run icons
//
// One-off: the outputs are committed, so run this only when the source artwork
// changes. Pure Node + pngjs so it works on any machine, including a cloud dev
// environment — it replaces an earlier PowerShell/System.Drawing version that
// only ran on Windows.

import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import { buildIco, canvas, compose, downscale } from "./lib/png.mjs";

const src = new URL("../assets/icon-source.png", import.meta.url);
const out = (name) => new URL(`../public/${name}`, import.meta.url);

const source = PNG.sync.read(readFileSync(src));
const square = (size) => downscale(source, size, size);
const write = (name, png) => {
  const buf = PNG.sync.write(png, { deflateLevel: 9 });
  writeFileSync(out(name), buf);
  console.log(
    `  ${name.padEnd(22)} ${png.width}x${png.height}`.padEnd(46) +
      `${(buf.length / 1024).toFixed(1)} Ko`,
  );
};

console.log(`Source ${source.width}x${source.height}. Icones generees :`);

// Browser tab. Transparent so they sit on light and dark tab strips alike.
const f16 = square(16);
const f32 = square(32);
const f48 = square(48);
write("favicon-16x16.png", f16);
write("favicon-32x32.png", f32);

// iOS home screen. Flattened on white on purpose: iOS composites home-screen
// icons onto an opaque tile and renders alpha badly.
write("apple-touch-icon.png", compose(canvas(180, 180), square(180)));

// Web app manifest / Android home screen.
write("icon-192.png", square(192));
write("icon-512.png", square(512));

// Multi-size .ico for bare /favicon.ico requests.
const ico = buildIco(
  [f16, f32, f48].map((p) => PNG.sync.write(p, { deflateLevel: 9 })),
  [16, 32, 48],
);
writeFileSync(out("favicon.ico"), ico);
console.log(
  `  ${"favicon.ico".padEnd(22)} 16/32/48`.padEnd(46) + `${(ico.length / 1024).toFixed(1)} Ko`,
);

// Social preview card. 1200x630 is the ratio every platform crops to.
const SIDE = 520;
write(
  "og-image.png",
  compose(
    canvas(1200, 630),
    square(SIDE),
    Math.round((1200 - SIDE) / 2),
    Math.round((630 - SIDE) / 2),
  ),
);
