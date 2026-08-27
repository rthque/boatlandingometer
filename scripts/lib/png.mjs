// Shared PNG helpers for the one-off asset generators in scripts/.
// Node + pngjs only, so they run anywhere the project does — including a
// cloud dev environment on Linux.

import { PNG } from "pngjs";

/**
 * Area-average downscale in premultiplied alpha.
 *
 * Premultiplying is the whole point: a cut-out PNG still has colour under its
 * transparent pixels, and averaging straight RGBA bleeds that colour into every
 * edge. It is also what reconstructs a smooth anti-aliased alpha edge from a
 * hard binary mask, which is how scripts/cutout-schema.mjs avoids a white
 * fringe around the structure.
 */
export function downscale(src, dstW, dstH) {
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
      const ix1 = Math.max(ix0 + 1, Math.ceil(x1));

      let ar = 0,
        ag = 0,
        ab = 0,
        aa = 0,
        wsum = 0;

      for (let yy = iy0; yy < iy1; yy++) {
        const wy = Math.min(yy + 1, y1) - Math.max(yy, y0);
        if (wy <= 0) continue;
        for (let xx = ix0; xx < ix1; xx++) {
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

/** A new opaque canvas filled with one colour. */
export function canvas(width, height, [r, g, b] = [255, 255, 255]) {
  const png = new PNG({ width, height });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = r;
    png.data[i + 1] = g;
    png.data[i + 2] = b;
    png.data[i + 3] = 255;
  }
  return png;
}

/** Source-over composite of `src` onto `dst` at (dx, dy). */
export function compose(dst, src, dx = 0, dy = 0) {
  for (let y = 0; y < src.height; y++) {
    const ty = y + dy;
    if (ty < 0 || ty >= dst.height) continue;
    for (let x = 0; x < src.width; x++) {
      const tx = x + dx;
      if (tx < 0 || tx >= dst.width) continue;
      const s = (y * src.width + x) << 2;
      const d = (ty * dst.width + tx) << 2;
      const a = src.data[s + 3] / 255;
      if (a === 0) continue;
      for (let c = 0; c < 3; c++) {
        dst.data[d + c] = Math.round(src.data[s + c] * a + dst.data[d + c] * (1 - a));
      }
      dst.data[d + 3] = 255;
    }
  }
  return dst;
}

/**
 * A multi-size .ico wrapping PNG payloads (what every browser since IE11
 * accepts, and far simpler than the legacy BMP-in-ICO format).
 */
export function buildIco(pngBuffers, sizes) {
  const header = Buffer.alloc(6 + 16 * pngBuffers.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngBuffers.length, 4);

  let offset = header.length;
  pngBuffers.forEach((buf, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(sizes[i], e); // width  (0 would mean 256)
    header.writeUInt8(sizes[i], e + 1); // height
    header.writeUInt8(0, e + 2); // palette size
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(buf.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });

  return Buffer.concat([header, ...pngBuffers]);
}
