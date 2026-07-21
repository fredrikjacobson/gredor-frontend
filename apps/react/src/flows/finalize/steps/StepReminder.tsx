import { useEffect, useMemo, useRef, useState } from "react";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { useFinalizeStore } from "@/stores/finalizeStore.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import {
  getTaxonomyManager,
  type TaxonomyManager,
} from "@/util/TaxonomyManager.ts";
import { TaxonomyRootName } from "@/model/taxonomy/TaxonomyItem.ts";
import { serializeReactHTMLToiXBRL } from "@/ix/serializeIxbrl.ts";
import { RENDER_FONT_FAMILY_WHITELIST } from "@/util/renderUtils.ts";
import { getAppFullVersion } from "@/util/configUtils.ts";
import { formatNumber } from "@/util/formatUtils.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";
import { ArsredovisningPreview } from "@/render/ArsredovisningPreview.tsx";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import {
  getBeloppraderWithNonexistingNoter,
  getMismatchingValueBelopprader,
  getNoterConnections,
  latestSignatureDate,
  orgnrIsFilledAndValid,
  requiredFieldsAreFilled,
  verksamhetsarDatesAreFilled,
  type ReminderTaxonomyManagers,
} from "@/flows/finalize/reminderChecks.ts";
import type { FinalizeStepProps } from "@/flows/finalize/steps/FinalizeStepProps.ts";

/**
 * Port av FinalizeReminder.vue — genererar iXBRL i bakgrunden (utan
 * fastställelseintyg) och påminner om notkopplingar, beloppskrockar och
 * obligatoriska fält. Nästa spärras tills iXBRL:en är klar och nödvändiga
 * uppgifter är ifyllda.
 */
export function StepReminder({
  goNext,
  cancel,
  stepNumber,
  numSteps,
}: FinalizeStepProps) {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  useArsredovisningStore((s) => s.revision);
  const ixbrl = useFinalizeStore((s) => s.ixbrl);
  const setIxbrl = useFinalizeStore((s) => s.setIxbrl);
  const showMessageModal = useUiStore((s) => s.showMessageModal);
  const containerRef = useRef<HTMLDivElement>(null);
  const [managers, setManagers] = useState<ReminderTaxonomyManagers | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      getTaxonomyManager(TaxonomyRootName.FORVALTNINGSBERATTELSE),
      getTaxonomyManager(TaxonomyRootName.RESULTATRAKNING_KOSTNADSSLAGSINDELAD),
      getTaxonomyManager(TaxonomyRootName.BALANSRAKNING),
      getTaxonomyManager(TaxonomyRootName.NOTER),
    ]).then(([fb, rr, br, noter]: TaxonomyManager[]) => {
      if (active)
        setManagers({
          forvaltningsberattelse: fb,
          resultatrakning: rr,
          balansrakning: br,
          noter,
        });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!arsredovisning) return;
    setIxbrl(null);
    let cancelled = false;
    let tries = 0;
    const tick = async () => {
      if (cancelled) return;
      const root = containerRef.current?.querySelector(".arsredovisning-root");
      const ready = root && root.querySelectorAll("table").length > 0;
      if (!ready) {
        if (tries++ > 200) return;
        setTimeout(() => void tick(), 250);
        return;
      }
      try {
        const { foretagsinformation } = arsredovisning;
        const result = await serializeReactHTMLToiXBRL(root as HTMLElement, {
          title: `${foretagsinformation.organisationsnummer} ${foretagsinformation.foretagsnamn} - Årsredovisning`,
          programVersion: getAppFullVersion(),
          fontFamilyWhitelist: RENDER_FONT_FAMILY_WHITELIST,
          requireFonts: true,
        });
        if (!cancelled) setIxbrl(result);
      } catch (e) {
        const details = e instanceof Error ? e.message : "Unknown error";
        showMessageModal(
          `Det gick inte att skapa dokumentet.\n\nSkulle felet fortsatt uppstå, mejla gredor@potatiz.com och uppge följande felmeddelande: ${details}`,
          "Fel",
        );
      }
    };
    const timer = setTimeout(() => void tick(), 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arsredovisning]);

  const noterConnections = useMemo(
    () => (arsredovisning && managers ? getNoterConnections(arsredovisning, managers) : []),
    [arsredovisning, managers],
  );
  const beloppraderWithNonexistingNoter = useMemo(
    () =>
      arsredovisning && managers
        ? getBeloppraderWithNonexistingNoter(arsredovisning, managers)
        : [],
    [arsredovisning, managers],
  );
  const mismatching = useMemo(
    () =>
      arsredovisning && managers
        ? getMismatchingValueBelopprader(arsredovisning, managers, ixbrl)
        : [],
    [arsredovisning, managers, ixbrl],
  );

  if (!arsredovisning) return null;

  const fieldsOk = requiredFieldsAreFilled(arsredovisning);
  const nextDisabled = !ixbrl || !fieldsOk;
  const senasteDatum = latestSignatureDate(arsredovisning);
  const valuta = arsredovisning.redovisningsinformation.redovisningsvaluta.namnKort;

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Glöm inte…
      </p>

      <p className="mb-3 text-sm text-ink-medium">
        Innan du går vidare vill vi bara påminna om ett par detaljer som kan vara
        lätta att missa! Glöm inte att kontrollera…
      </p>

      <ul className="ml-5 list-disc space-y-3 text-sm text-ink-medium">
        <li>
          …att alla noter är korrekt kopplade, om de ska ha någon koppling
          <ul
            className="ml-5 list-disc space-y-1 pt-1 text-ink-light"
            data-testid="finalize-reminder-noter-connections-list"
          >
            {noterConnections.map((n) => (
              <li key={n.notnummer}>
                Not {n.notnummer} ({n.notLabel}) är just nu{" "}
                {n.connections.length > 0
                  ? `kopplad till "${n.connections.join('", "')}"`
                  : "inte kopplad till någon belopprad"}
              </li>
            ))}
            {beloppraderWithNonexistingNoter.map((b, i) => (
              <li key={`missing-${i}`}>
                Belopprad "{b.beloppradLabel}" är kopplad till not {b.not} som
                inte finns
              </li>
            ))}
          </ul>
        </li>
        <li>
          …att fastställandedatum och underskriftsdatumen stämmer. Du har fyllt
          i:
          <ul
            className="ml-5 list-disc space-y-1 pt-1 text-ink-light"
            data-testid="finalize-reminder-redovisningsinformation-list"
          >
            <li>
              Datering:{" "}
              {arsredovisning.redovisningsinformation.datering || (
                <strong className="text-danger">Inget ifyllt!</strong>
              )}
            </li>
            {arsredovisning.redovisningsinformation.underskrifter.map((u, i) => (
              <li key={i}>
                Underskrift,{" "}
                {u.tilltalsnamn || (
                  <strong className="text-danger">&lt;tilltalsnamn saknas!&gt;</strong>
                )}{" "}
                {u.efternamn ? (
                  `${u.efternamn}:`
                ) : (
                  <strong className="text-danger">&lt;efternamn saknas!&gt;:</strong>
                )}{" "}
                {u.datum || (
                  <strong className="text-danger">&lt;datum saknas!&gt;</strong>
                )}
              </li>
            ))}
          </ul>
          {senasteDatum && (
            <div data-testid="finalize-reminder-latest-signature-date">
              Årsstämman får därmed hållas <strong>tidigast {senasteDatum}</strong>.
            </div>
          )}
        </li>
        {mismatching.length > 0 && (
          <li>
            …beloppen för följande fält; det förekommer olika värden på olika
            ställen och du bör korrigera detta:
            <ul
              className="ml-5 list-disc space-y-1 pt-1 text-ink-light"
              data-testid="finalize-reminder-mismatching-values-list"
            >
              {mismatching.map((m, i) => (
                <li key={i}>
                  {m.label}: [
                  {m.values.map((v, j) => (
                    <span key={j}>
                      {j > 0 ? " / " : ""}
                      {formatNumber(
                        v.belopp,
                        null,
                        v.decimals === "-3" ? BeloppFormat.TUSENTAL : BeloppFormat.HELTAL,
                      )}
                      {v.decimals === "-3" ? " (tusental)" : ""}
                    </span>
                  ))}
                  ] {valuta}
                </li>
              ))}
            </ul>
          </li>
        )}
        {!orgnrIsFilledAndValid(arsredovisning) && (
          <li data-testid="finalize-reminder-invalid-orgnr">
            …att organisationsnumret är korrekt ifyllt under "Grunduppgifter";{" "}
            <strong>just nu är det inte korrekt ifyllt.</strong>
          </li>
        )}
        {!verksamhetsarDatesAreFilled(arsredovisning) && (
          <li data-testid="finalize-reminder-invalid-verksamhetsar">
            …att verksamhetsåren är korrekt ifyllda under "Grunduppgifter";{" "}
            <strong>just nu är de inte korrekt ifyllda.</strong>
          </li>
        )}
      </ul>

      {/* Dold render — källa för iXBRL-serialiseringen (utan fastställelseintyg). */}
      <div ref={containerRef} className="pointer-events-none absolute -left-[99999px]">
        <ArsredovisningPreview arsredovisning={arsredovisning} />
      </div>

      <WizardFooter
        onCancel={cancel}
        onNext={goNext}
        nextDisabled={nextDisabled}
        previousHidden
        nextLabel={
          ixbrl
            ? fieldsOk
              ? "Nästa"
              : "Nödvändiga uppgifter saknas!"
            : "Vänta – arbetar i bakgrunden…"
        }
      />
    </div>
  );
}
