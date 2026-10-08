import { useRef } from "react";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import incidentClip from "@/assets/splash-zone-incident.mp4";

/**
 * The "what is this for" button and its panel.
 *
 * Deliberately an icon at the end of the control stack rather than anything
 * louder: someone who already knows what the app does should never have to look
 * at it.
 */
export function AboutDialog() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-8 bg-background/90 backdrop-blur-sm"
          aria-label="What this app is for"
          title="What this app is for"
        >
          <InfoIcon className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent
        ref={contentRef}
        tabIndex={-1}
        // Radix focuses the first tabbable child on open, which here is the
        // video. Landing on the panel instead keeps the focus ring off the
        // player and keeps Escape unambiguous; Tab still reaches the controls.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          contentRef.current?.focus();
        }}
        className="max-h-[85dvh] max-w-2xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>What Boatlandingometer is for</DialogTitle>
          <DialogDescription>
            Reading a working window off the structure, not off a table of tide times.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            It draws the Dieppe tide against the jacket and its boat landing at the same scale, so
            the water level you are planning around is a line on the structure rather than a number
            on a page.
          </p>
          <p>Use it to judge:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>when the tether line clamp is clear of the water long enough to be rigged</li>
            <li>when the splash zone is workable, and for how long</li>
            <li>
              how much time a repair has before the tide comes back to the height of the damage —
              the intervention itself plus the drying the coating needs
            </li>
          </ul>
          <p className="text-muted-foreground">
            Drag the red line to any height, or use the presets. WC59 puts the CTV against the
            landing at that water level. Time-lapse runs either the hours of a day, with the water
            climbing and falling, or the days themselves with the water held at the height you set —
            so you can pick a level and watch which days give it to you, and when.
          </p>
        </div>

        {/* Every claim here was measured from the same ephemeris the chart
            draws: culmination gaps of 0.5 h at new moon, 6.4 h and 6.3 h at the
            quarters and 11.8 h at full, and a mean moonrise lag of 52 minutes
            over a month. Re-check them if the wording ever changes. */}
        <div className="space-y-2 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">The sun, the moon and the tide</h3>
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>
              The sun-and-moon button next to WC59 draws the sun and the moon across the sky above
              the chart, on the same time axis as the tide, so you can read the cause next to the
              effect.
            </p>
            <p>
              <strong className="text-foreground">
                The moon&rsquo;s shape is its angle to the sun.
              </strong>{" "}
              At new and full moon the two line up, their pulls add, and the range is biggest —
              spring tides, the high coefficients. At the quarters they pull at right angles and
              partly cancel — neap tides. You can see it in where the two tracks peak: together at
              new moon, six hours apart at the quarters, twelve apart at full.
            </p>
            <p>
              The moon also rises about fifty minutes later each day, and the high waters slide with
              it. Run the time-lapse in <em>Days</em> mode to watch the phase turn over, the tracks
              drift apart and back, and the range swell and fall with them.
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">Why the window matters</h3>
          <p className="text-sm text-muted-foreground">
            A rope access technician caught by a wave in the splash zone. Anticipating the window is
            what keeps a job from ending like this.
          </p>
          {/* No aspect ratio declared: the file carries its own (368x640), and
              the height cap is the only thing stopping a portrait clip from
              filling the panel. playsInline matters — without it iOS hijacks
              the tap into its own fullscreen player. */}
          <video
            src={incidentClip}
            controls
            playsInline
            preload="metadata"
            className="mx-auto max-h-[60dvh] w-auto rounded-md border border-border bg-black"
          />
        </div>

        {/* Last, and deliberately so: it is what should still be in view when
            the panel is closed. The app is safety-adjacent and free, which is
            exactly the combination that needs the relationship stated. */}
        <div className="space-y-2 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">Terms of use and disclaimer</h3>
          <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
            <p>
              Boatlandingometer is a personal project, built by its author for his own use and
              shared as-is and free of charge. It is an{" "}
              <strong className="text-foreground">indicative planning aid only</strong>: not a
              navigational instrument, not a safety device, and not an official source of
              information.
            </p>
            <p>
              <strong className="text-foreground">
                The tide heights and times shown are computed predictions, not official data.
              </strong>{" "}
              For anything you act on, refer to the SHOM (the French hydrographic and oceanographic
              service) or to the official tide tables for the port concerned. Wave and wind figures
              come from a public weather model and are a forecast, not an observation and not a
              marine safety bulletin. Real water levels are additionally affected by atmospheric
              pressure, wind, surge and local conditions that this tool does not model.
            </p>
            <p>
              <strong className="text-foreground">Every operational decision remains yours.</strong>{" "}
              Whether a transfer, a climb, an intervention or any other work may proceed is for the
              vessel&rsquo;s master, the duty holder for the site and the crew to judge against
              their own procedures, limits and risk assessment. Nothing displayed here authorises,
              recommends or clears any operation.
            </p>
            <p>
              The tool is provided{" "}
              <strong className="text-foreground">without warranty of any kind</strong>, express or
              implied, including as to accuracy, completeness, availability or fitness for a
              particular purpose. To the fullest extent permitted by applicable law, the author
              accepts no liability for any loss, damage, injury or cost arising from its use, its
              misuse, its unavailability, or from any error, omission or interruption in the data it
              displays.
            </p>
            <p>By using it, you accept these terms. If you do not accept them, do not use it.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
