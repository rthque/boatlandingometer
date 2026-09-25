import blImg from "@/assets/bl.png";
import fouImg from "@/assets/fou.png";
import irlImg from "@/assets/irl.png";
import wc59Img from "@/assets/wc59.png";

// Tide station used for both the predictions and the sunrise/sunset times.
export const DIEPPE = { latitude: 49.9253, longitude: 1.0758 };

// Optional night backdrop: a photo saved as src/assets/night-sea.{jpg,png,webp}
// replaces the drawn night sky and sea. With no such file this resolves to null
// and the scene falls back to the drawn one, so the build works either way —
// import.meta.glob yields an empty object when nothing matches rather than
// failing to resolve an import.
const nightSeaModules = import.meta.glob<{ default: string }>(
  "../assets/night-sea.{jpg,jpeg,png,webp}",
  { eager: true },
);
export const NIGHT_SEA_IMG: string | null = Object.values(nightSeaModules)[0]?.default ?? null;

// Where the horizon sits in that photo, as a fraction of its height. The scene
// pins it to the same height-derived horizon the drawn sky uses, so the
// structure keeps standing *in* the world instead of in front of a picture.
//
// Measured on the current night-sea.webp (1344x768) rather than eyeballed: mean
// row luminance climbs steadily from the zenith, peaks at y=378 where the haze
// gathers, then falls away sharply into the sea. Re-measure the same way if you
// swap in a photo framed differently.
export const NIGHT_SEA_HORIZON_FRAC = 0.492;

// Optional DAY backdrop, same contract as the night one: a photo saved as
// src/assets/day-sea.{jpg,jpeg,png,webp} turns on the photographic day scene.
// With no such file this is null and the day view falls back, unchanged, to the
// drawn sky with its fixed 4 m horizon and its waterline on chart datum.
//
// That fallback is the whole rollback story for this feature: delete the file
// and the day view is exactly what it was before the photo existed. Sorted so
// two files matching at once resolve the same way every build rather than
// depending on glob order.
const daySeaModules = import.meta.glob<{ default: string }>(
  "../assets/day-sea.{jpg,jpeg,png,webp}",
  { eager: true },
);
export const DAY_SEA_IMG: string | null =
  Object.keys(daySeaModules)
    .sort()
    .map((k) => daySeaModules[k].default)[0] ?? null;

/**
 * Where the horizon sits in the day plate, as a fraction of its height.
 *
 * Unlike the night photo, whose horizon is pinned to a fixed 4 m, this plate's
 * horizon rides the red height line — so it sweeps the whole 0..10 m range and
 * both halves of the picture get used. Mid-height is therefore the efficient
 * framing, and the brief for the artwork asks for it: in the BL view the app
 * has to be able to show 93.4% of the plot in sky (line at 0 m) and 92.1% in
 * water (line at 10 m), and a centred horizon is the only framing where
 * neither half is the binding constraint.
 *
 * Measure it the same way as the night one if you swap the plate: mean row
 * luminance, not eyeballing.
 */
export const DAY_SEA_HORIZON_FRAC = 0.5;

export type ViewId = "BL" | "FOU" | "IRL";

export type ViewConfig = {
  img: string;
  ratio: number;
  calib: { h: number; frac: number }[];
  // The face of the boat landing the WC59's bow fender rests against, as a
  // fraction of the image width. A CTV works by pushing its fender onto the
  // landing and holding there, so in this side-on projection the vessel
  // overlaps the landing rather than floating clear of it. Measured as the
  // LEFT edge of the central landing column — see each view below.
  bowBerthFrac: number;
};

export const VIEWS: Record<ViewId, ViewConfig> = {
  BL: {
    img: blImg,
    ratio: 1896 / 1456,
    // Measured from bl.png (1896×1456). The calibration marks are the two
    // horizontal "→" arrows pointing at the leg: "10m→" shaft at y≈115
    // (frac 0.079) and "0m→" shaft at y≈1360 (frac 0.934). (The red collar
    // band at frac 0.266 is a structural feature, NOT the 10m level.)
    // Landing column's left edge, measured on the alpha channel at 3/5/7 m:
    // frac 0.4947 / 0.4963 / 0.4963.
    bowBerthFrac: 0.495,
    calib: [
      { h: 10, frac: 0.079 },
      { h: 0, frac: 0.934 },
    ],
  },
  FOU: {
    img: fouImg,
    ratio: 3968 / 4257,
    // Measured from fou.png (3968×4257): the "10m→" arrow shaft points at the
    // leg at y≈2291 (frac 0.538) and the "0m→" arrow at y≈3733 (frac 0.877).
    // Landing column's left edge, measured on the alpha channel at 3/5/7 m:
    // frac 0.4785 / 0.4796 / 0.4796.
    bowBerthFrac: 0.479,
    calib: [
      { h: 10, frac: 0.538 },
      { h: 0, frac: 0.877 },
    ],
  },
  IRL: {
    img: irlImg,
    ratio: 768 / 1365,
    // Measured from irl.png (768×1365), the real-world photo. Three red "→"
    // marks printed on the leg: "10m→" shaft at frac 0.448, the "tether line→"
    // arrow at frac 0.8128, and "1m→" shaft at frac 0.988. A photo has
    // perspective, so the mapping is piecewise-linear through these three
    // points — this puts the tether line at 3.5m (not the 3.92m a straight
    // 10m–1m line would give) while keeping 10m and 1m exact.
    // The one berth that is NOT the column's left edge, and the one left
    // untouched when the other two were measured. Two reasons. irl.png is a
    // photograph, so there is no alpha silhouette to scan and an edge scan
    // wandered between frac 0.43 and 0.55 depending on the row. And this is a
    // close-up, so the landing is wide in frame: putting the bow on its left
    // edge buries the ladder under the hull, and the ladder is what the view
    // exists to show. At 0.62 the fender already meets the column on the near
    // side with no gap, which reads the same to anyone looking at it.
    bowBerthFrac: 0.62,
    calib: [
      { h: 10, frac: 0.448 },
      { h: 3.5, frac: 0.8128 },
      { h: 1, frac: 0.988 },
    ],
  },
};

// WC59 — the CTV (crew transfer vessel) overlay, src/assets/wc59.png (2574×1254).
// The bow (front) is on the LEFT. Measured from the image: the waterline (top of
// the periwinkle below-waterline band) is at y≈1059, and the highest blue point
// of the hull at the bow is at y≈671 — that 388 px vertical span is 3 m in
// reality. The boat is scaled so this span = 3 m on the schema's height axis, its
// waterline sits on the red line, and its bow fender lands on bowBerthFrac.
export const WC59 = {
  img: wc59Img,
  ratio: 2574 / 1254,
  waterlineFrac: 1059 / 1254, // top→waterline, fraction of image height
  refFrac: (1059 - 671) / 1254, // bow-top→waterline span, fraction of height
  refM: 3, // real height of that span (m)
  // Leftmost pixel of the black bow fender, so the fender itself can be put on
  // the berth line rather than the image's edge. It is only ~0.4% of the width
  // in — the fender all but touches the edge of the artwork — but anchoring on
  // it is what makes bowBerthFrac mean exactly what it says.
  bowFenderFracX: 10 / 2574,
};
