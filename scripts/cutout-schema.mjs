// Turns the white-matted CAD renders into transparent-background PNGs so the
// sky/sea scene shows through the lattice, and downscales them to a sane web
// size at the same time.
//
//   node scripts/cutout-schema.mjs
//
// Reads assets/<name>-source.png (the untouched originals) and writes
// src/assets/<name>.png. Re-run after replacing a source render.
//
// Why not a luminance key: these renders are COLOURED line art. Bright yellow
// has a high luminance, so "alpha = 1 - lightness" would eat the structure.
// Instead we key a hard binary mask at full resolution (a pixel is background
// only if it is essentially pure white), then downscale with a premultiplied
// area filter. The resampling is what produces smooth anti-aliased alpha —
// which is why the result has no white fringe, unlike a soft value key.

import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

// A pixel counts as background when its darkest channel is at least this. The
// renders' matte is exactly 255; the slack swallows the lightest edge pixels.
const WHITE = 245;

const JOBS = [
  // fou is 3968x4257 and displayed at roughly 750-1000 CSS px wide, so 2000 px
  // tall still covers a 2x display with room to spare.
  { name: "fou", maxHeight: 2000 },
  // bl is already 1896x1456 — close enough to its 2x display size to keep.
  { name: "bl", maxHeight: null },
];

function keyToAlpha(png) {
  const { width, height, data } = png;
  let cleared = 0;
  for (let i = 0; i < data.length; i += 4) {
    const mn = Math.min(data[i], data[i + 1], data[i + 2]);
    if (mn >= WHITE) {
      data[i + 3] = 0;
      cleared++;
    } else {
      data[i + 3] = 255;
    }
  }
  return { cleared, total: width * height };
}

// Area-average downscale in premultiplied alpha. Premultiplying matters: the
// cleared pixels are still white underneath, and averaging them straight would
// bleed white into every edge.
function downscale(src, dstW, dstH) {
  const dst = new PNG({ width: dstW, height: dstH });
  const sx = src.width / dstW;
  const sy = src.height / dstH;

  for (let y = 0; y < dstH; y++) {
    const y0 = y * sy;
    const y1 = Math.min(src.height, (y + 1) * sy);
    const iy0 = Math.floor(y0);
    const iy1 = Math.max(iy0 + 1, Math.ceil(y1));

    for (let x = 0; x < dstW; x++) {
      const x0 = x * sx;
      const x1 = Math.min(src.width, (x + 1) * sx);
      const ix0 = Math.floor(x0);
      const ix0c = ix0;
      const ix1 = Math.max(ix0 + 1, Math.ceil(x1));

      let ar = 0,
        ag = 0,
        ab = 0,
        aa = 0,
        wsum = 0;

      for (let yy = iy0; yy < iy1; yy++) {
        const wy = Math.min(yy + 1, y1) - Math.max(yy, y0);
        if (wy <= 0) continue;
        for (let xx = ix0c; xx < ix1; xx++) {
          const wx = Math.min(xx + 1, x1) - Math.max(xx, x0);
          if (wx <= 0) continue;
          const w = wx * wy;
          const i = (yy * src.width + xx) << 2;
          const a = src.data[i + 3] / 255;
          ar += src.data[i] * a * w;
          ag += src.data[i + 1] * a * w;
          ab += src.data[i + 2] * a * w;
          aa += a * w;
          wsum += w;
        }
      }

      const o = (y * dstW + x) << 2;
      if (aa > 0) {
        // Un-premultiply back to straight alpha.
        dst.data[o] = Math.round(ar / aa);
        dst.data[o + 1] = Math.round(ag / aa);
        dst.data[o + 2] = Math.round(ab / aa);
        dst.data[o + 3] = Math.round((aa / wsum) * 255);
      } else {
        dst.data[o] = 0;
        dst.data[o + 1] = 0;
        dst.data[o + 2] = 0;
        dst.data[o + 3] = 0;
      }
    }
  }
  return dst;
}

for (const { name, maxHeight } of JOBS) {
  const srcPath = new URL(`../assets/${name}-source.png`, import.meta.url);
  const outPath = new URL(`../src/assets/${name}.png`, import.meta.url);

  const png = PNG.sync.read(readFileSync(srcPath));
  const { cleared, total } = keyToAlpha(png);

  let out = png;
  if (maxHeight && png.height > maxHeight) {
    const w = Math.round((png.width * maxHeight) / png.height);
    out = downscale(png, w, maxHeight);
  }

  const buf = PNG.sync.write(out, { deflateLevel: 9 });
  writeFileSync(outPath, buf);

  const before = readFileSync(srcPath).length;
  console.log(
    `${name}: ${png.width}x${png.height} -> ${out.width}x${out.height}, ` +
      `${((100 * cleared) / total).toFixed(1)}% transparent, ` +
      `${(before / 1024 / 1024).toFixed(2)} Mo -> ${(buf.length / 1024 / 1024).toFixed(2)} Mo`,
  );
}
