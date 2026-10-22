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
import { useLang, useT } from "@/hooks/use-lang";
import incidentClip from "@/assets/splash-zone-incident.mp4";

/**
 * The "what is this for" button and its panel.
 *
 * Deliberately an icon at the end of the control stack rather than anything
 * louder: someone who already knows what the app does should never have to look
 * at it.
 *
 * The panel is written out twice, once per language, rather than cut into
 * dictionary strings: it is prose full of emphasis, and a sentence split around
 * a <strong> stops being translatable as a sentence. Keep the two in step — a
 * claim changed in one and not the other is a panel that says two things.
 */
export function AboutDialog() {
  const contentRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();
  const t = useT();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-8 bg-background/90 backdrop-blur-sm"
          aria-label={t.aboutLabel}
          title={t.aboutLabel}
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
        {lang === "fr" ? <BodyFr /> : <BodyEn />}
      </DialogContent>
    </Dialog>
  );
}

/** The incident clip. It has no words, so both languages share it. */
function IncidentClip() {
  return (
    // No aspect ratio declared: the file carries its own (368x640), and the
    // height cap is the only thing stopping a portrait clip from filling the
    // panel. playsInline matters — without it iOS hijacks the tap into its own
    // fullscreen player.
    <video
      src={incidentClip}
      controls
      playsInline
      preload="metadata"
      className="mx-auto max-h-[60dvh] w-auto rounded-md border border-border bg-black"
    />
  );
}

function BodyEn() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>What Boatlandingometer is for</DialogTitle>
        <DialogDescription>
          Reading a working window off the structure, not off a table of tide times.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 text-sm leading-relaxed">
        <p>
          It draws the Dieppe tide against the jacket and its boat landing at the same scale, so the
          water level you are planning around is a line on the structure rather than a number on a
          page.
        </p>
        <p>Use it to judge:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>when the tether line clamp is clear of the water long enough to be rigged</li>
          <li>when the splash zone is workable, and for how long</li>
          <li>
            how much time a repair has before the tide comes back to the height of the damage — the
            intervention itself plus the drying the coating needs
          </li>
        </ul>
        <p className="text-muted-foreground">
          Drag the red line to any height, or use the presets. WC59 puts the CTV against the landing
          at that water level. Time-lapse runs either the hours of a day, with the water climbing
          and falling, or the days themselves with the water held at the height you set — so you can
          pick a level and watch which days give it to you, and when.
        </p>
        <p className="text-muted-foreground">
          Over the forecast week the chart draws the forecast sea around the tide (the{" "}
          <em>Waves on chart</em> switch in the forecast panel turns it off): a band from half the
          biggest expected wave below the tide to half of it above. Its upper edge is the highest
          the water is estimated to reach at each hour — <em>half</em>, not the whole height,
          because a wave is measured trough to crest and its trough lies below the tide. It is an
          estimate of the open sea surface: real crests stand a little higher than troughs fall, and
          spray and run-up on the legs reach higher still.
        </p>
        <p className="text-muted-foreground">
          With the band on, the red line is read against that upper edge instead of the tide: its
          times are when the biggest waves cross your height, and its durations — marked with a
          small wave — are how long they stay below it. Those are shorter than the tide's, and for
          work exposed to the sea they are the ones that count. On a day the forecast does not fully
          cover, the line goes back to the tide and the mark disappears.
        </p>
      </div>

      {/* Every claim here was measured from the same ephemeris the chart
          draws: culmination gaps of 0.5 h at new moon, 6.4 h and 6.3 h at the
          quarters and 11.8 h at full, and a mean moonrise lag of 52 minutes
          over a month. Re-check them if the wording ever changes — in both
          languages. */}
      <div className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">The sun, the moon and the tide</h3>
        <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            The sun-and-moon button next to WC59 draws the sun and the moon across the sky above the
            chart, on the same time axis as the tide, so you can read the cause next to the effect.
          </p>
          <p>
            <strong className="text-foreground">
              The moon&rsquo;s shape is its angle to the sun.
            </strong>{" "}
            At new and full moon the two line up, their pulls add, and the range is biggest — spring
            tides, the high coefficients. At the quarters they pull at right angles and partly
            cancel — neap tides. You can see it in where the two tracks peak: together at new moon,
            six hours apart at the quarters, twelve apart at full.
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
        <IncidentClip />
      </div>

      {/* Last, and deliberately so: it is what should still be in view when
          the panel is closed. The app is safety-adjacent and free, which is
          exactly the combination that needs the relationship stated. */}
      <div className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">Terms of use and disclaimer</h3>
        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
          <p>
            Boatlandingometer is a personal project, built by its author for his own use and shared
            as-is and free of charge. It is an{" "}
            <strong className="text-foreground">indicative planning aid only</strong>: not a
            navigational instrument, not a safety device, and not an official source of information.
          </p>
          <p>
            <strong className="text-foreground">
              The tide heights and times shown are computed predictions, not official data.
            </strong>{" "}
            For anything you act on, refer to the SHOM (the French hydrographic and oceanographic
            service) or to the official tide tables for the port concerned. Wave and wind figures
            come from a public weather model and are a forecast, not an observation and not a marine
            safety bulletin. Real water levels are additionally affected by atmospheric pressure,
            wind, surge and local conditions that this tool does not model.
          </p>
          <p>
            <strong className="text-foreground">Every operational decision remains yours.</strong>{" "}
            Whether a transfer, a climb, an intervention or any other work may proceed is for the
            vessel&rsquo;s master, the duty holder for the site and the crew to judge against their
            own procedures, limits and risk assessment. Nothing displayed here authorises,
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
    </>
  );
}

/**
 * The same panel in French. Faithful to the English rather than adapted, the
 * terms of use above all: the SHOM sentence and "la décision vous appartient"
 * carry the same weight here as their English originals (see CLAUDE.md, Terms
 * of use). Field words the crews use as they are — jacket, boat landing,
 * splash zone, tether line, CTV — stay in English, as they do on site.
 */
function BodyFr() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>À quoi sert Boatlandingometer</DialogTitle>
        <DialogDescription>
          Lire une fenêtre de travail sur la structure, et non dans un tableau d&rsquo;horaires de
          marée.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 text-sm leading-relaxed">
        <p>
          L&rsquo;application trace la marée de Dieppe sur le jacket et son boat landing, à la même
          échelle&nbsp;: le niveau d&rsquo;eau autour duquel vous planifiez devient une ligne sur la
          structure plutôt qu&rsquo;un chiffre sur une page.
        </p>
        <p>Elle sert à évaluer&nbsp;:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            quand le collier de la tether line reste hors de l&rsquo;eau assez longtemps pour être
            gréé
          </li>
          <li>quand la splash zone est praticable, et pour combien de temps</li>
          <li>
            de combien de temps dispose une réparation avant que la marée ne remonte à la hauteur du
            défaut — l&rsquo;intervention elle-même, plus le séchage dont le revêtement a besoin
          </li>
        </ul>
        <p className="text-muted-foreground">
          Faites glisser la ligne rouge à la hauteur voulue, ou utilisez les préréglages. WC59 place
          le CTV contre le boat landing à ce niveau d&rsquo;eau. L&rsquo;accéléré fait défiler soit
          les heures d&rsquo;une journée, l&rsquo;eau montant et descendant, soit les jours
          eux-mêmes, l&rsquo;eau restant à la hauteur choisie — pour choisir un niveau et voir quels
          jours l&rsquo;offrent, et à quelle heure.
        </p>
        <p className="text-muted-foreground">
          Sur la semaine couverte par la prévision, le graphique trace la mer prévue autour de la
          marée (l&rsquo;interrupteur <em>Afficher les vagues</em> du panneau de prévision la
          masque)&nbsp;: une bande qui va de la moitié de la plus grosse vague attendue sous la
          marée à la moitié au-dessus. Son bord supérieur est le niveau le plus haut que l&rsquo;eau
          devrait atteindre à chaque heure — <em>la moitié</em>, et non la hauteur entière, car une
          vague se mesure du creux à la crête et son creux se trouve sous le niveau de la marée.
          C&rsquo;est une estimation de la surface de la mer au large&nbsp;: les crêtes réelles
          montent un peu plus haut que les creux ne descendent, et les embruns et la remontée de
          l&rsquo;eau le long des jambes vont plus haut encore.
        </p>
        <p className="text-muted-foreground">
          Quand la bande est affichée, la ligne rouge se lit par rapport à ce bord supérieur et non
          plus à la marée&nbsp;: ses heures sont celles où les plus grosses vagues franchissent
          votre hauteur, et ses durées — marquées d&rsquo;une petite vague — le temps qu&rsquo;elles
          restent en dessous. Elles sont plus courtes que celles de la marée, et pour un travail
          exposé à la mer, ce sont elles qui comptent. Un jour que la prévision ne couvre pas
          entièrement, la ligne revient à la marée et la marque disparaît.
        </p>
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">Le soleil, la lune et la marée</h3>
        <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            Le bouton soleil-et-lune, à côté de WC59, trace le soleil et la lune dans le ciel
            au-dessus du graphique, sur le même axe des temps que la marée&nbsp;: on lit la cause à
            côté de l&rsquo;effet.
          </p>
          <p>
            <strong className="text-foreground">
              La forme de la lune, c&rsquo;est son angle avec le soleil.
            </strong>{" "}
            À la nouvelle et à la pleine lune, les deux s&rsquo;alignent, leurs attractions
            s&rsquo;additionnent et le marnage est le plus grand — les vives-eaux, les forts
            coefficients. Aux quartiers, elles tirent à angle droit et se compensent en partie — les
            mortes-eaux. On le voit à l&rsquo;endroit où culminent les deux trajectoires&nbsp;:
            ensemble à la nouvelle lune, à six heures d&rsquo;écart aux quartiers, à douze heures à
            la pleine lune.
          </p>
          <p>
            La lune se lève aussi environ cinquante minutes plus tard chaque jour, et les pleines
            mers se décalent avec elle. Lancez l&rsquo;accéléré en mode <em>Jours</em> pour voir la
            phase tourner, les trajectoires s&rsquo;écarter puis se rejoindre, et le marnage enfler
            puis retomber avec elles.
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">Pourquoi la fenêtre compte</h3>
        <p className="text-sm text-muted-foreground">
          Un technicien cordiste surpris par une vague dans la splash zone. Anticiper la fenêtre,
          c&rsquo;est ce qui évite qu&rsquo;une intervention se termine ainsi.
        </p>
        <IncidentClip />
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">Conditions d&rsquo;utilisation et avertissement</h3>
        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
          <p>
            Boatlandingometer est un projet personnel, conçu par son auteur pour son propre usage et
            partagé en l&rsquo;état, à titre gratuit. C&rsquo;est{" "}
            <strong className="text-foreground">
              une aide à la planification, à titre indicatif uniquement
            </strong>
            &nbsp;: ni un instrument de navigation, ni un dispositif de sécurité, ni une source
            d&rsquo;information officielle.
          </p>
          <p>
            <strong className="text-foreground">
              Les hauteurs et heures de marée affichées sont des prédictions calculées, et non des
              données officielles.
            </strong>{" "}
            Pour toute décision, reportez-vous au SHOM (Service hydrographique et océanographique de
            la Marine) ou aux annuaires des marées officiels du port concerné. Les valeurs de vagues
            et de vent proviennent d&rsquo;un modèle météorologique public&nbsp;: ce sont des
            prévisions, ni des observations, ni un bulletin de sécurité marine. Le niveau réel de
            l&rsquo;eau dépend en outre de la pression atmosphérique, du vent, des surcotes et de
            conditions locales que cet outil ne modélise pas.
          </p>
          <p>
            <strong className="text-foreground">
              Toute décision opérationnelle vous appartient.
            </strong>{" "}
            Il revient au capitaine du navire, au responsable du site et à l&rsquo;équipe de juger,
            selon leurs propres procédures, limites et analyses de risques, si un transfert, une
            montée, une intervention ou tout autre travail peut avoir lieu. Rien de ce qui est
            affiché ici n&rsquo;autorise, ne recommande ni ne valide une opération.
          </p>
          <p>
            L&rsquo;outil est fourni{" "}
            <strong className="text-foreground">sans garantie d&rsquo;aucune sorte</strong>,
            expresse ou implicite, notamment quant à son exactitude, son exhaustivité, sa
            disponibilité ou son adéquation à un usage particulier. Dans toute la mesure permise par
            la loi applicable, l&rsquo;auteur décline toute responsabilité pour toute perte, tout
            dommage, toute blessure ou tout coût résultant de son utilisation, de sa mauvaise
            utilisation, de son indisponibilité, ou de toute erreur, omission ou interruption des
            données qu&rsquo;il affiche.
          </p>
          <p>
            En l&rsquo;utilisant, vous acceptez ces conditions. Si vous ne les acceptez pas, ne
            l&rsquo;utilisez pas.
          </p>
        </div>
      </div>
    </>
  );
}
