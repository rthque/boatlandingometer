import type { PlotGeom } from "@/lib/geom";
import { WC59 } from "@/lib/views";

type Props = {
  geom: PlotGeom;
  targetHeight: number;
  bowBerthFrac: number;
  imageLeft: number;
  imageDisplayWidth: number;
  /** Photographic day scene: the hull below the line is treated as immersed. */
  dayPhoto?: boolean;
  /** Time-lapse playing: cheap grade instead of the refraction. */
  simplify?: boolean;
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
  dayPhoto,
  simplify,
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

  const common = {
    href: WC59.img,
    x: boatLeft,
    y: boatTop,
    width: boatW,
    height: boatH,
    preserveAspectRatio: "none" as const,
  };

  // One sprite in the drawn scene — the water there is a veil at chart datum,
  // far below the hull, so there is nothing to be immersed in — and one sprite
  // again while a time-lapse plays, where splitting it costs a filtered image
  // with a clip that moves every frame (measured ~6 fps) to render a seam
  // nobody can see at four days a second.
  if (!dayPhoto || simplify) {
    return <image {...common} clipPath="url(#plotClip)" pointerEvents="none" />;
  }

  // In the photographic scene the sea surface IS this waterline, so the hull
  // below it gets exactly what the legs get — refracted and graded, then seen
  // through the veil drawn over everything. Splitting on the boat's own
  // waterline means the cut lands where the artwork already changes, so the
  // seam is invisible and only the treatment differs.
  return (
    <g clipPath="url(#plotClip)" pointerEvents="none">
      <defs>
        <clipPath id="wc59Above">
          <rect x={boatLeft} y={boatTop} width={boatW} height={Math.max(0, wlY - boatTop)} />
        </clipPath>
        <clipPath id="wc59Below">
          <rect x={boatLeft} y={wlY} width={boatW} height={Math.max(0, boatTop + boatH - wlY)} />
        </clipPath>
      </defs>
      <g clipPath="url(#wc59Above)">
        <image {...common} />
      </g>
      {/* The clip is on the wrapper here, not on the <image> as in
          BackgroundLayer: this branch is the day scene only, which has no
          baseline to match, and the group is what carries plotClip anyway. */}
      <g clipPath="url(#wc59Below)">
        <image {...common} filter={simplify ? "url(#daySubmerged)" : "url(#daySubmergedRefract)"} />
      </g>
    </g>
  );
}
