import type { PlotGeom } from "@/lib/geom";
import { WC59 } from "@/lib/views";

type Props = {
  geom: PlotGeom;
  targetHeight: number;
  bowBerthFrac: number;
  imageLeft: number;
  imageDisplayWidth: number;
};

// WC59 CTV — its waterline sits on the red line, scaled so the bow (top of the
// blue hull) → waterline = 3 m on the schema's height axis; its bow fender
// against the boat landing, and it rises and falls with the tide.
//
// It stays in that berth during the time-lapse too, riding straight up and down
// the boat landing. It used to track the marker along the sinusoid, which read
// as the boat sailing across the structure: the x axis is time, so horizontal
// travel there is not movement through the water. Height against the landing is
// the thing being judged, and it is easier to read when nothing else moves.
export function Wc59Overlay({
  geom,
  targetHeight,
  bowBerthFrac,
  imageLeft,
  imageDisplayWidth,
}: Props) {
  const { yOfH } = geom;
  const wlY = yOfH(targetHeight);
  // 3 m of screen height measured locally at the waterline.
  const px3m = wlY - yOfH(targetHeight + WC59.refM);
  if (!(px3m > 0)) return null;
  const boatH = px3m / WC59.refFrac;
  const boatW = boatH * WC59.ratio;
  const boatTop = wlY - WC59.waterlineFrac * boatH;
  // Berthed with the bow fender on the landing, whatever the tide is doing and
  // whether or not the time-lapse is running. The fender sits a little way into
  // the artwork, so that inset comes off the image's x to put the fender itself
  // — not the edge of the PNG — on the berth line.
  const boatLeft = imageLeft + bowBerthFrac * imageDisplayWidth - WC59.bowFenderFracX * boatW;
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
