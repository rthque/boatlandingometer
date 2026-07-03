import type { PlotGeom } from "@/lib/geom";
import { WC59 } from "@/lib/views";

type Props = {
  geom: PlotGeom;
  targetHeight: number;
  landingRightFrac: number;
  imageLeft: number;
  imageDisplayWidth: number;
  animActive: boolean;
  animT: number;
};

// WC59 CTV — its waterline sits on the red line, scaled so the bow (top of the
// blue hull) → waterline = 3 m on the schema's height axis; parked just right of
// the boat landing, and it rises/falls with the tide. During the time-lapse it
// follows the moving marker along the sinusoid instead.
export function Wc59Overlay({
  geom,
  targetHeight,
  landingRightFrac,
  imageLeft,
  imageDisplayWidth,
  animActive,
  animT,
}: Props) {
  const { xOfT, yOfH } = geom;
  const wlY = yOfH(targetHeight);
  // 3 m of screen height measured locally at the waterline.
  const px3m = wlY - yOfH(targetHeight + WC59.refM);
  if (!(px3m > 0)) return null;
  const boatH = px3m / WC59.refFrac;
  const boatW = boatH * WC59.ratio;
  const boatTop = wlY - WC59.waterlineFrac * boatH;
  // While the time-lapse runs, the boat's leftmost blue waterline point tracks
  // the red dot along the sinusoid. Otherwise it parks just right of the boat
  // landing (bow at the column's right edge).
  const boatLeft = animActive
    ? xOfT(animT) - WC59.bowWaterlineFracX * boatW
    : imageLeft + landingRightFrac * imageDisplayWidth;
  return (
    <image
      href={WC59.img}
      x={boatLeft}
      y={boatTop}
      width={boatW}
      height={boatH}
      preserveAspectRatio="none"
      clipPath="url(#plotClip)"
      pointerEvents="none"
    />
  );
}
