import blImg from "@/assets/bl.png";
import fouImg from "@/assets/fou.png";
import irlImg from "@/assets/irl.png";
import wc59Img from "@/assets/wc59.png";

// Tide station used for both the predictions and the sunrise/sunset times.
export const DIEPPE = { latitude: 49.9253, longitude: 1.0758 };

export type ViewId = "BL" | "FOU" | "IRL";

export type ViewConfig = {
  img: string;
  ratio: number;
  calib: { h: number; frac: number }[];
  // Right edge of the central boat-landing column, as a fraction of the image
  // width — the WC59 CTV is parked just to the right of this.
  landingRightFrac: number;
};

export const VIEWS: Record<ViewId, ViewConfig> = {
  BL: {
    img: blImg,
    ratio: 1896 / 1456,
    // Measured from bl.png (1896×1456). The calibration marks are the two
    // horizontal "→" arrows pointing at the leg: "10m→" shaft at y≈115
    // (frac 0.079) and "0m→" shaft at y≈1360 (frac 0.934). (The red collar
    // band at frac 0.266 is a structural feature, NOT the 10m level.)
    landingRightFrac: 0.61,
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
    landingRightFrac: 0.55,
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
    landingRightFrac: 0.62,
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
// waterline sits on the red line, and it is parked just right of the boat landing.
export const WC59 = {
  img: wc59Img,
  ratio: 2574 / 1254,
  waterlineFrac: 1059 / 1254, // top→waterline, fraction of image height
  refFrac: (1059 - 671) / 1254, // bow-top→waterline span, fraction of height
  refM: 3, // real height of that span (m)
  bowWaterlineFracX: 142 / 2574, // leftmost blue point at waterline, frac of width
};
