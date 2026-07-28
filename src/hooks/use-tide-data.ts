import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { getTideExtremes, getTideCoefficients } from "@/lib/tides";
import { extremesToPoints, type ExtremePoint } from "@/lib/tide-math";

// Predictions are computed in-process from the baked-in harmonic constituents
// (see src/lib/tides.ts), so these hooks are synchronous — no fetch, no
// loading state.

/** The selected day's tide extremes, projected into plot space. */
export function useTideExtremes(selectedDate: Date): { allExtremes: ExtremePoint[] } {
  const allExtremes = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return extremesToPoints(getTideExtremes(dateStr).extremes, selectedDate);
  }, [selectedDate]);

  return { allExtremes };
}

// Tide coefficients for the visible calendar month (padded so the
// leading/trailing days of adjacent months are coloured too), fetched when the
// picker is open. Results bin per local day, keeping each day's max
// coefficient. Months accumulate so paging back and forth doesn't re-flash.
export function useCoefByDay(datePickerOpen: boolean, calMonth: Date) {
  const [coefByDay, setCoefByDay] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!datePickerOpen) return;
    const first = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
    const last = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0);
    const start = new Date(first.getTime() - 7 * 86400_000);
    const end = new Date(last.getTime() + 7 * 86400_000);

    const { highs } = getTideCoefficients(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"));

    const map: Record<string, number> = {};
    for (const h of highs) {
      const key = format(new Date(h.time), "yyyy-MM-dd");
      map[key] = Math.max(map[key] ?? 0, h.coef);
    }
    setCoefByDay((prev) => ({ ...prev, ...map }));
  }, [datePickerOpen, calMonth]);

  return coefByDay;
}
