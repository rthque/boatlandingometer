import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getTideExtremes, getTideCoefficients } from "@/lib/api/tides.functions";
import { extremesToPoints, type ExtremePoint } from "@/lib/tide-math";

// Fetch the selected day's tide extremes and project them into plot space.
export function useTideExtremes(selectedDate: Date) {
  const [allExtremes, setAllExtremes] = useState<ExtremePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    getTideExtremes({ data: { date: dateStr } })
      .then((result) => {
        setAllExtremes(extremesToPoints(result.extremes, selectedDate));
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return { allExtremes, loading };
}

// Fetch tide coefficients for the visible calendar month (padded so the
// leading/trailing days of adjacent months are coloured too) when the picker
// is open. Results bin per local day, keeping each day's max coefficient.
export function useCoefByDay(datePickerOpen: boolean, calMonth: Date) {
  const [coefByDay, setCoefByDay] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!datePickerOpen) return;
    const first = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
    const last = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0);
    const start = new Date(first.getTime() - 7 * 86400_000);
    const end = new Date(last.getTime() + 7 * 86400_000);
    let cancelled = false;
    getTideCoefficients({
      data: {
        start: format(start, "yyyy-MM-dd"),
        end: format(end, "yyyy-MM-dd"),
      },
    }).then((result) => {
      if (cancelled) return;
      const map: Record<string, number> = {};
      for (const h of result.highs) {
        const key = format(new Date(h.time), "yyyy-MM-dd");
        map[key] = Math.max(map[key] ?? 0, h.coef);
      }
      setCoefByDay((prev) => ({ ...prev, ...map }));
    });
    return () => {
      cancelled = true;
    };
  }, [datePickerOpen, calMonth]);

  return coefByDay;
}
