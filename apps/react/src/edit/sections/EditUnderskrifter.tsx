import { type ReactNode } from "react";
import { Info, Trash2 } from "lucide-react";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { EditGroup } from "@/edit/EditGroup.tsx";
import { ScrollspySection, type ScrollspyGroup } from "@/edit/ScrollspySection.tsx";

const UNDERSKRIFTER_GROUPS: ScrollspyGroup[] = [
  { id: "underskrifter-ort-datum", title: "Ort och datum" },
  { id: "underskrifter-personer", title: "Underskrifter" },
];

function InfoAlert({ children }: { children: ReactNode }) {
  return (
    <Alert variant="info">
      <Info />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

/** Port av EditUnderskrifter.vue — ort/datum + lista med undertecknare. */
export function EditUnderskrifter() {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  const edit = useArsredovisningStore((s) => s.edit);
  useArsredovisningStore((s) => s.revision);

  if (!arsredovisning) return null;
  const { redovisningsinformation } = arsredovisning;

  return (
    <ScrollspySection groups={UNDERSKRIFTER_GROUPS}>
      <div className="mb-2">
        <InfoAlert>
          Efter att du har färdigställt årsredovisningen kommer du behöva signera
          den, antingen digitalt eller på papper. Signeringen måste göras de
          datum som du har fyllt i nedan. Därför är det ofta bäst att fylla i
          detta avsnitt allra sist.
        </InfoAlert>
      </div>

      <EditGroup id="underskrifter-ort-datum" title="Ort och datum">
        <Field label="Ort för undertecknande" htmlFor="undertecknandeOrt">
          <Input
            id="undertecknandeOrt"
            value={redovisningsinformation.undertecknandeOrt ?? ""}
            onChange={(e) =>
              edit((ar) => {
                ar.redovisningsinformation.undertecknandeOrt = e.target.value;
              })
            }
            onBlur={(e) =>
              edit((ar) => {
                ar.redovisningsinformation.undertecknandeOrt =
                  e.target.value.trim();
              })
            }
          />
        </Field>
        <Field
          label="Datum då årsredovisningen var upprättad (redo att skrivas under)"
          htmlFor="datering"
        >
          <Input
            id="datering"
            type="date"
            value={redovisningsinformation.datering ?? ""}
            onChange={(e) =>
              edit((ar) => {
                ar.redovisningsinformation.datering = e.target.value.trim();
              })
            }
          />
          <p className="mt-1 text-xs text-ink-light">
            Får <strong>inte</strong> vara senare än datumet för tidigaste
            underskriften nedan.
          </p>
        </Field>
      </EditGroup>

      <EditGroup id="underskrifter-personer" title="Underskrifter">
        <InfoAlert>
          Namnen <strong>måste</strong> stämma överens med vad som är registrerat
          hos Bolagsverket.
        </InfoAlert>

        <div className="grid gap-4 sm:grid-cols-2">
          {redovisningsinformation.underskrifter.map((underskrift, index) => (
            <Card key={index} className="gap-0 py-4">
              <CardContent className="space-y-3 px-4">
                <Field label="Tilltalsnamn" htmlFor={`tilltalsnamn${index}`}>
                  <Input
                    id={`tilltalsnamn${index}`}
                    value={underskrift.tilltalsnamn}
                    onChange={(e) =>
                      edit((ar) => {
                        ar.redovisningsinformation.underskrifter[
                          index
                        ].tilltalsnamn = e.target.value;
                      })
                    }
                    onBlur={(e) =>
                      edit((ar) => {
                        ar.redovisningsinformation.underskrifter[
                          index
                        ].tilltalsnamn = e.target.value.trim();
                      })
                    }
                  />
                </Field>
                <Field label="Efternamn" htmlFor={`efternamn${index}`}>
                  <Input
                    id={`efternamn${index}`}
                    value={underskrift.efternamn}
                    onChange={(e) =>
                      edit((ar) => {
                        ar.redovisningsinformation.underskrifter[
                          index
                        ].efternamn = e.target.value;
                      })
                    }
                    onBlur={(e) =>
                      edit((ar) => {
                        ar.redovisningsinformation.underskrifter[
                          index
                        ].efternamn = e.target.value.trim();
                      })
                    }
                  />
                </Field>
                <Field label="Befattning (valfritt)" htmlFor={`roll${index}`}>
                  <Input
                    id={`roll${index}`}
                    value={underskrift.roll}
                    onChange={(e) =>
                      edit((ar) => {
                        ar.redovisningsinformation.underskrifter[index].roll =
                          e.target.value;
                      })
                    }
                    onBlur={(e) =>
                      edit((ar) => {
                        ar.redovisningsinformation.underskrifter[index].roll =
                          e.target.value.trim();
                      })
                    }
                  />
                </Field>
                <Field label="Underskriftsdatum" htmlFor={`datum${index}`}>
                  <Input
                    id={`datum${index}`}
                    type="date"
                    value={underskrift.datum}
                    onChange={(e) =>
                      edit((ar) => {
                        ar.redovisningsinformation.underskrifter[index].datum =
                          e.target.value.trim();
                      })
                    }
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  onClick={() =>
                    edit((ar) => {
                      ar.redovisningsinformation.underskrifter.splice(index, 1);
                    })
                  }
                >
                  <Trash2 className="size-4" /> Ta bort person
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          type="button"
          onClick={() =>
            edit((ar) => {
              ar.redovisningsinformation.underskrifter.push({
                tilltalsnamn: "",
                efternamn: "",
                roll: "",
                datum: new Date().toISOString().split("T")[0],
              });
            })
          }
        >
          Lägg till person
        </Button>
      </EditGroup>
    </ScrollspySection>
  );
}
