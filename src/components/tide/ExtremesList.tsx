import { fmtTime, type ExtremePoint } from "@/lib/tide-math";

// The list of the day's high/low waters (time, height and, for high waters, the
// tidal coefficient), pinned to the bottom-left on phones and top-left on wider
// screens.
export function ExtremesList({ extremes }: { extremes: ExtremePoint[] }) {
  return (
    <div className="absolute top-8 left-2 z-20 flex flex-col gap-0.5">
      {extremes.map((e, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium bg-background/90 backdrop-blur-sm border border-border"
        >
          <span className={e.high ? "text-orange-600" : "text-emerald-600"}>
            {e.high ? "▲ HW" : "▼ LW"}
          </span>
          <span>{fmtTime(e.t)}</span>
          <span className="text-muted-foreground">{e.h.toFixed(2)}m</span>
          {e.high && e.coef !== null && (
            <span
              className="ml-0.5 rounded bg-sky-600/15 px-1 font-semibold text-sky-700"
              title="Tidal coefficient"
            >
              {e.coef}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
