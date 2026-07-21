import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import type { ResultatdispositionBeslut } from "@/model/arsredovisning/Faststallelseintyg.ts";
import { isBeloppradMonetary } from "@/model/arsredovisning/beloppradtyper/BeloppradMonetary.ts";
import {
  FASTSTALLELSEINTYG_UNDERSKRIFT_ROLLER,
  RESULTATDISPOSITION_BESLUT,
  RESULTATDISPOSITION_STAMMANS_DEFINITIONS,
  ResultatdispositionBeslutGodkannaForlust,
  ResultatdispositionBeslutGodkannaVinst,
  ResultatdispositionBeslutInteGodkannaForlust,
  ResultatdispositionBeslutInteGodkannaVinst,
  isFaststallseintygRequiresStammansResultatdisposition,
} from "@/data/faststallelseintyg.ts";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select } from "@/components/ui/select.tsx";

/**
 * Port av EditFaststallelseintyg.vue — redigerar beslut om resultatdisposition
 * (samt stämmans egna vid "inte godkänna") och underskrift. Muterar
 * årsredovisningen in-place via `edit` (som Vue; inga setters).
 */
export function EditFaststallelseintyg({
  arsredovisning,
  edit,
}: {
  arsredovisning: Arsredovisning;
  edit: (mutator: (arsredovisning: Arsredovisning) => void) => void;
}) {
  const faststallelseintyg = arsredovisning.faststallelseintyg;

  // Visa bara relevanta beslut: vinst-alternativ om fritt eget kapital >= 0,
  // förlust-alternativ om < 0. Saknas posten visas alla fyra.
  const availableBeslut = getAvailableResultatdispositionBeslut(arsredovisning);
  const requiresStammans =
    isFaststallseintygRequiresStammansResultatdisposition(faststallelseintyg);

  return (
    <div className="space-y-4">
      <fieldset className="rounded-lg border border-line bg-surface-medium p-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="resultatdispositionBeslut">
            Beslut resultatdisposition:
          </Label>
          <Select
            id="resultatdispositionBeslut"
            value={faststallelseintyg.resultatdispositionBeslut.text}
            onChange={(e) => {
              const chosen = availableBeslut.find(
                (b) => b.text === e.target.value,
              );
              if (chosen)
                edit((ar) => {
                  ar.faststallelseintyg.resultatdispositionBeslut = chosen;
                });
            }}
          >
            {availableBeslut.map((beslut) => (
              <option key={beslut.text} value={beslut.text}>
                {beslut.text}
              </option>
            ))}
          </Select>
        </div>

        {requiresStammans && (
          <div className="mt-4">
            <strong className="mb-2 block underline">
              Istället beslöt årsstämman:
            </strong>
            <div className="grid gap-4 sm:grid-cols-3">
              {RESULTATDISPOSITION_STAMMANS_DEFINITIONS.map((definition) => (
                <div key={definition.key}>
                  <Label htmlFor={`resultatdispositionBeslutEgen-${definition.key}`}>
                    {definition.textBefore}
                  </Label>
                  <Input
                    id={`resultatdispositionBeslutEgen-${definition.key}`}
                    inputMode="numeric"
                    value={faststallelseintyg.resultatdispositionStammans[definition.key] ?? ""}
                    onChange={(e) => {
                      const next = e.target.value.trim();
                      if (!/^\d*$/.test(next)) return; // whitelist: endast siffror
                      edit((ar) => {
                        ar.faststallelseintyg.resultatdispositionStammans[
                          definition.key
                        ] = next;
                      });
                    }}
                  />
                  <Label htmlFor={`resultatdispositionBeslutEgen-${definition.key}`}>
                    {definition.textAfter}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="rounded-lg border border-line bg-surface-medium p-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="datumArsstamma">Datum för årsstämma:</Label>
          <Input
            id="datumArsstamma"
            type="date"
            className="max-w-xs"
            value={faststallelseintyg.datumArsstamma}
            onChange={(e) =>
              edit((ar) => {
                ar.faststallelseintyg.datumArsstamma = e.target.value.trim();
              })
            }
          />
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-line bg-surface-medium p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="tilltalsnamn">Ditt tilltalsnamn:</Label>
            <Input
              id="tilltalsnamn"
              value={faststallelseintyg.underskrift.tilltalsnamn}
              onChange={(e) =>
                edit((ar) => {
                  ar.faststallelseintyg.underskrift.tilltalsnamn =
                    e.target.value.trim();
                })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="efternamn">Ditt/dina efternamn:</Label>
            <Input
              id="efternamn"
              value={faststallelseintyg.underskrift.efternamn}
              onChange={(e) =>
                edit((ar) => {
                  ar.faststallelseintyg.underskrift.efternamn =
                    e.target.value.trim();
                })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="roll">Din befattning:</Label>
            <Select
              id="roll"
              value={faststallelseintyg.underskrift.roll}
              onChange={(e) =>
                edit((ar) => {
                  ar.faststallelseintyg.underskrift.roll = e.target.value;
                })
              }
            >
              {FASTSTALLELSEINTYG_UNDERSKRIFT_ROLLER.map((roll) => (
                <option key={roll} value={roll}>
                  {roll}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </fieldset>
    </div>
  );
}

/**
 * Speglar EditFaststallelseintyg.vue:s availableResultatdispositionBeslut:
 * vinst-alternativ om fritt eget kapital >= 0, förlust om < 0, alla fyra om
 * posten saknas i balansräkningen.
 */
function getAvailableResultatdispositionBeslut(
  arsredovisning: Arsredovisning,
): readonly ResultatdispositionBeslut[] {
  const frittEgetKapital = arsredovisning.balansrakning.find(
    (rad) => rad.taxonomyItemName === "se-gen-base:FrittEgetKapital",
  );
  if (!frittEgetKapital || !isBeloppradMonetary(frittEgetKapital)) {
    return RESULTATDISPOSITION_BESLUT;
  }
  const belopp = Number.parseInt(frittEgetKapital.beloppNuvarandeAr, 10);
  return belopp >= 0
    ? [ResultatdispositionBeslutGodkannaVinst, ResultatdispositionBeslutInteGodkannaVinst]
    : [ResultatdispositionBeslutGodkannaForlust, ResultatdispositionBeslutInteGodkannaForlust];
}
