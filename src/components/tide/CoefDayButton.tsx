import { type ComponentProps } from "react";
import { format } from "date-fns";
import { CalendarDayButton } from "@/components/ui/calendar";
import { coefColor } from "@/lib/tide-math";

export type CoefDayButtonComponent = ReturnType<typeof makeCoefDayButton>;

// Build a calendar day cell that tints itself with the day's tide coefficient
// and shows the coefficient under the day number.
export function makeCoefDayButton(coefByDay: Record<string, number>) {
  return function CoefDayButton(props: ComponentProps<typeof CalendarDayButton>) {
    const { day, modifiers } = props;
    const coef = coefByDay[format(day.date, "yyyy-MM-dd")];
    const tint = !modifiers.selected && coef != null ? coefColor(coef) : undefined;
    return (
      <CalendarDayButton
        {...props}
        style={{ ...props.style, ...(tint ? { backgroundColor: tint } : {}) }}
      >
        {day.date.getDate()}
        {coef != null && (
          <span className="!text-[0.6rem] !opacity-90 font-semibold leading-none">{coef}</span>
        )}
      </CalendarDayButton>
    );
  };
}
