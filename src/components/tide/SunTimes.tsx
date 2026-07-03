import { SunriseIcon, SunsetIcon } from "lucide-react";
import type { PlotGeom } from "@/lib/geom";
import { fmtTime } from "@/lib/tide-math";

type Props = {
  geom: PlotGeom;
  sunriseH: number | null;
  sunsetH: number | null;
};

// Sunrise / sunset times, just above the night bands at the day boundary:
// sunrise on the right edge of the morning (left) band, sunset on the left edge
// of the evening (right) band. Rendered as HTML overlays, not inside the SVG.
export function SunTimes({ geom, sunriseH, sunsetH }: Props) {
  const { xOfT, yOfH } = geom;
  return (
    <>
      {sunriseH !== null && sunriseH > 0 && (
        <div
          className="absolute z-10 flex items-center gap-1 rounded border border-border bg-background/90 px-1.5 py-0.5 text-xs font-medium backdrop-blur-sm pointer-events-none"
          style={{
            left: xOfT(sunriseH) - 4,
            top: yOfH(10) - 28,
            transform: "translateX(-100%)",
          }}
        >
          <SunriseIcon className="size-3.5 text-amber-500" />
          <span>{fmtTime(sunriseH)}</span>
        </div>
      )}
      {sunsetH !== null && sunsetH < 24 && (
        <div
          className="absolute z-10 flex items-center gap-1 rounded border border-border bg-background/90 px-1.5 py-0.5 text-xs font-medium backdrop-blur-sm pointer-events-none"
          style={{ left: xOfT(sunsetH) + 4, top: yOfH(10) - 28 }}
        >
          <SunsetIcon className="size-3.5 text-amber-500" />
          <span>{fmtTime(sunsetH)}</span>
        </div>
      )}
    </>
  );
}
