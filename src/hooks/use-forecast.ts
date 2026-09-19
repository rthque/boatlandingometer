import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fetchForecast, type DayForecast } from "@/lib/forecast";

/**
 * The forecast for the selected day, if that day is inside the model's window.
 *
 * One request for the whole window, cached: the app changes date constantly and
 * re-fetching per day would hammer the endpoint for data already in hand. Half
 * an hour of staleness is well inside the cadence these models are published
 * at, and a single retry is enough — this is a nice-to-have panel, not
 * something worth hanging the page on.
 */
export function useForecast(selectedDate: Date): {
  day: DayForecast | null;
  outOfRange: boolean;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: ["forecast"],
    queryFn: ({ signal }) => fetchForecast(signal),
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const key = format(selectedDate, "yyyy-MM-dd");
  const day = query.data?.find((d) => d.date === key) ?? null;

  return {
    day,
    // Only meaningful once something came back: before that we cannot know
    // whether the date is covered, and saying "beyond the forecast" while still
    // loading would be a lie that then has to correct itself.
    outOfRange: !!query.data && !day,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
