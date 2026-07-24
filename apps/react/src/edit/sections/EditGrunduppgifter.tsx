import { useRef } from "react";
import { Trash2 } from "lucide-react";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { REDOVISNINGSVALUTOR } from "@/data/redovisningsvalutor.ts";
import { AVGIVANDE_TYPER } from "@/data/avgivande.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { Input } from "@/components/ui/input.tsx";
import { Select } from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { EditGroup } from "@/edit/EditGroup.tsx";
import { Field } from "@/edit/Field.tsx";
import { ScrollspySection, type ScrollspyGroup } from "@/edit/ScrollspySection.tsx";

const MAX_LOGO_SIZE_KB = 512;

export const GRUNDUPPGIFTER_GROUPS: ScrollspyGroup[] = [
  { id: "grunduppgifter-foretagsinformation", title: "Företagsinformation" },
  { id: "grunduppgifter-redovisningsinformation", title: "Redovisningsinformation" },
  { id: "grunduppgifter-rakenskapsar", title: "Räkenskapsår" },
];

/**
 * Port av EditGrunduppgifter.vue — men platt (grupper i stället för accordion).
 * Redigerar företagsinformation, redovisningsinformation och räkenskapsår.
 */
export function EditGrunduppgifter() {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  const edit = useArsredovisningStore((s) => s.edit);
  // Prenumerera på revision så kontrollerade fält speglar in-place-ändringar.
  useArsredovisningStore((s) => s.revision);
  const logoInputRef = useRef<HTMLInputElement>(null);

  if (!arsredovisning) return null;
  const { foretagsinformation, redovisningsinformation } = arsredovisning;

  function onLogoFilePicked(file: File) {
    if (file.size > MAX_LOGO_SIZE_KB * 1024) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") return;
      edit((ar) => {
        ar.foretagsinformation.logotyp.base64 = reader.result as string;
      });
    });
    reader.readAsDataURL(file);
  }

  return (
    <ScrollspySection groups={GRUNDUPPGIFTER_GROUPS}>
      <EditGroup
        id="grunduppgifter-foretagsinformation"
        title="Företagsinformation"
      >
        <Field label="Företagsnamn" htmlFor="foretagsnamn" width="wide">
          <Input
            id="foretagsnamn"
            value={foretagsinformation.foretagsnamn}
            onChange={(e) =>
              edit((ar) => {
                ar.foretagsinformation.foretagsnamn = e.target.value;
              })
            }
            onBlur={(e) =>
              edit((ar) => {
                ar.foretagsinformation.foretagsnamn = e.target.value.trim();
              })
            }
          />
        </Field>

        <Field label="Organisationsnummer" htmlFor="organisationsnummer" width="narrow">
          <Input
            id="organisationsnummer"
            value={foretagsinformation.organisationsnummer}
            inputMode="numeric"
            placeholder="XXXXXX-XXXX"
            onChange={(e) =>
              edit((ar) => {
                ar.foretagsinformation.organisationsnummer = e.target.value.trim();
              })
            }
          />
        </Field>

        <Field label={`Logotyp (valfri; max ${MAX_LOGO_SIZE_KB} kB)`}>
          {foretagsinformation.logotyp.base64 == null ? (
            <>
              <input
                ref={logoInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onLogoFilePicked(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
              >
                Välj bild…
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="border border-ink">
                <img
                  src={foretagsinformation.logotyp.base64}
                  alt="Logotyp"
                  className="h-10"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Ta bort logotyp"
                onClick={() =>
                  edit((ar) => {
                    ar.foretagsinformation.logotyp.base64 = null;
                  })
                }
              >
                <Trash2 className="size-4 text-danger" />
              </Button>
            </div>
          )}
        </Field>

        {foretagsinformation.logotyp.base64 && (
          <Field label="Placering av logotyp" htmlFor="logotyp-placering" width="narrow">
            <Select
              id="logotyp-placering"
              value={foretagsinformation.logotyp.placering}
              onChange={(e) =>
                edit((ar) => {
                  ar.foretagsinformation.logotyp.placering = e.target
                    .value as typeof ar.foretagsinformation.logotyp.placering;
                })
              }
            >
              <option value="topp">Topp</option>
              <option value="vänster">Vänster</option>
              <option value="höger">Höger</option>
            </Select>
          </Field>
        )}
      </EditGroup>

      <EditGroup
        id="grunduppgifter-redovisningsinformation"
        title="Redovisningsinformation"
      >
        <Field label="Vem som avger årsredovisningen" htmlFor="avgivande">
          <Select
            id="avgivande"
            value={redovisningsinformation.avgivande.xbrlId}
            onChange={(e) =>
              edit((ar) => {
                const found = AVGIVANDE_TYPER.find(
                  (a) => a.xbrlId === e.target.value,
                );
                if (found) ar.redovisningsinformation.avgivande = found;
              })
            }
          >
            {AVGIVANDE_TYPER.map((avgivande) => (
              <option key={avgivande.xbrlId} value={avgivande.xbrlId}>
                {avgivande.namn}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Redovisningsvaluta" htmlFor="valutakod" width="narrow">
          <Select
            id="valutakod"
            value={redovisningsinformation.redovisningsvaluta.xbrlId}
            onChange={(e) =>
              edit((ar) => {
                const found = REDOVISNINGSVALUTOR.find(
                  (v) => v.xbrlId === e.target.value,
                );
                if (found) ar.redovisningsinformation.redovisningsvaluta = found;
              })
            }
          >
            {REDOVISNINGSVALUTOR.map((valuta) => (
              <option key={valuta.xbrlId} value={valuta.xbrlId}>
                {valuta.kod} – {valuta.namn}
              </option>
            ))}
          </Select>
        </Field>
      </EditGroup>

      <EditGroup id="grunduppgifter-rakenskapsar" title="Räkenskapsår">
        <Field
          label="Startdatum räkenskapsår för årsredovisningen"
          htmlFor="startdatumNuvarande"
          width="narrow"
        >
          <Input
            id="startdatumNuvarande"
            type="date"
            min="2024-07-01"
            value={arsredovisning.verksamhetsarNuvarande.startdatum}
            onChange={(e) =>
              edit((ar) => {
                ar.verksamhetsarNuvarande.startdatum = e.target.value.trim();
              })
            }
          />
        </Field>
        <Field
          label="Slutdatum räkenskapsår för årsredovisningen"
          htmlFor="slutdatumNuvarande"
          width="narrow"
        >
          <Input
            id="slutdatumNuvarande"
            type="date"
            value={arsredovisning.verksamhetsarNuvarande.slutdatum}
            onChange={(e) =>
              edit((ar) => {
                ar.verksamhetsarNuvarande.slutdatum = e.target.value.trim();
              })
            }
          />
        </Field>

        {[1, 2, 3].map((i) => (
          <TidigareRakenskapsar
            key={i}
            i={i}
            arsredovisning={arsredovisning}
            edit={edit}
          />
        ))}
      </EditGroup>
    </ScrollspySection>
  );
}

/** Ett tidigare räkenskapsår (i = 1..3), aktiveras via kryssruta. */
function TidigareRakenskapsar({
  i,
  arsredovisning,
  edit,
}: {
  i: number;
  arsredovisning: Arsredovisning;
  edit: (m: (ar: Arsredovisning) => void) => void;
}) {
  const active = arsredovisning.verksamhetsarTidigare[i - 1] != null;
  return (
    <div className="border-t border-line pt-4">
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={active}
          onChange={(e) =>
            edit((ar) => {
              if (e.target.checked) {
                while (ar.verksamhetsarTidigare.length < i) {
                  ar.verksamhetsarTidigare.push({
                    startdatum: "2000-01-01",
                    slutdatum: "2000-12-31",
                  });
                }
              } else {
                ar.verksamhetsarTidigare.length = i - 1;
              }
            })
          }
        />
        Verksamheten existerade {i} år före årsredovisningens räkenskapsår
      </label>

      {active && (
        <div className="mt-3 space-y-3">
          <Field label={`Startdatum tidigare räkenskapsår, ${i} år före`} width="narrow">
            <Input
              type="date"
              value={arsredovisning.verksamhetsarTidigare[i - 1].startdatum}
              onChange={(e) =>
                edit((ar) => {
                  ar.verksamhetsarTidigare[i - 1].startdatum =
                    e.target.value.trim();
                })
              }
            />
          </Field>
          <Field label={`Slutdatum tidigare räkenskapsår, ${i} år före`} width="narrow">
            <Input
              type="date"
              value={arsredovisning.verksamhetsarTidigare[i - 1].slutdatum}
              onChange={(e) =>
                edit((ar) => {
                  ar.verksamhetsarTidigare[i - 1].slutdatum =
                    e.target.value.trim();
                })
              }
            />
          </Field>
        </div>
      )}
    </div>
  );
}
