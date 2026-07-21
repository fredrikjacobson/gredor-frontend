import { useRef, useState } from "react";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { createArsredovisningFromTemplate } from "@/model/arsredovisning/Arsredovisning.ts";
import { starterArsredovisning } from "@/templates/starterArsredovisning.ts";
import { mapSieFileIntoArsredovisning } from "@/util/sieUtils.ts";
import {
  AvgivandeLikvidator,
  AvgivandeStyrelsen,
  AvgivandeStyrelsenOchVD,
} from "@/data/avgivande.ts";
import { addTodoListItem } from "@/model/todolist/TodoList.ts";
import { client } from "@/api/client.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";

/**
 * Port av EditNewArsredovisningModal.vue. Användaren fyller i organisationsnummer
 * (namn + räkenskapsår hämtas från Bolagsverket) och kan valfritt importera en
 * SIE-fil för att förfylla RR/BR + delar av förvaltningsberättelsen.
 */
export function NewArsredovisningDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (arsredovisning: Arsredovisning) => void;
}) {
  const showMessageModal = useUiStore((s) => s.showMessageModal);
  const arRef = useRef<Arsredovisning>(
    createArsredovisningFromTemplate(starterArsredovisning),
  );
  const [orgnr, setOrgnr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sieMessages, setSieMessages] = useState<string[]>([]);
  const [sieFileName, setSieFileName] = useState("");
  const sieInputRef = useRef<HTMLInputElement>(null);

  const orgnrValid = /^\d{10}$/.test(orgnr.replace("-", ""));

  async function handleSieFile(file: File) {
    setBusy(true);
    try {
      // Nollställ mallen men behåll orgnr.
      arRef.current = createArsredovisningFromTemplate(starterArsredovisning);
      arRef.current.foretagsinformation.organisationsnummer = orgnr.trim();
      const messages: string[] = [];
      const text = await file.text();
      await mapSieFileIntoArsredovisning(text, arRef.current, (m) =>
        messages.push(m),
      );
      setSieMessages(messages);
      setSieFileName(file.name);
      if (messages.length > 0) {
        showMessageModal(
          messages.join("\n") +
            "\n\nVarningarna kommer att dyka upp i din att-åtgärda-lista.",
          "SIE-import",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    setBusy(true);
    const ar = arRef.current;
    ar.foretagsinformation.organisationsnummer = orgnr.trim();
    try {
      const { data, error } = await client.GET(
        "/v1/information/records/{orgnr}",
        { params: { path: { orgnr: orgnr.replace("-", "") } } },
      );
      if (error || !data) throw new Error("no data");

      ar.foretagsinformation.foretagsnamn = data.foretagsnamn;
      ar.redovisningsinformation.avgivande = data.harLikvidator
        ? AvgivandeLikvidator
        : data.harVerkstallandeDirektor
          ? AvgivandeStyrelsenOchVD
          : AvgivandeStyrelsen;

      const perioder = data.rakenskapsperioder;
      ar.verksamhetsarNuvarande.startdatum = perioder[0]?.from ?? "";
      ar.verksamhetsarNuvarande.slutdatum = perioder[0]?.tom ?? "";
      ar.verksamhetsarTidigare = perioder.slice(1).map((r) => ({
        startdatum: r.from ?? "",
        slutdatum: r.tom ?? "",
      }));

      if (perioder[0]?.kravPaRevisionsberattelse === "ja") {
        showMessageModal(
          "Bolaget har krav på revisionsberättelse det senaste räkenskapsåret." +
            " Observera att Gredor ej har stöd för revisionsberättelser; du" +
            " kommer ändå kunna skapa en årsredovisning i Gredor, men du kommer" +
            " inte kunna ladda upp den till Bolagsverket.",
          "OBS!",
        );
      }
    } catch {
      showMessageModal(
        "Misslyckades med att hämta företagets namn och räkenskapsår från" +
          " Bolagsverket. Du kan ändå gå vidare och arbeta på din" +
          " årsredovisning, förutsatt att du redovisar för ett aktiebolag.",
        "Varning",
      );
    } finally {
      if (sieMessages.length > 0) {
        addTodoListItem(ar.gredorState.todoList, {
          id: "sie-import",
          title: "Varningar från SIE-import",
          description:
            "Följande varningar uppstod när du importerade din SIE-fil.",
          timestamp: Date.now(),
          tasks: sieMessages.map((message) => ({ text: message, complete: false })),
        });
      }
      setBusy(false);
      onCreated(JSON.parse(JSON.stringify(ar)) as Arsredovisning);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ny årsredovisning</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label htmlFor="new-ar-orgnr">Organisationsnummer</Label>
            <p className="mb-2 text-sm text-ink-medium">
              Gredor hämtar företagets namn och senaste räkenskapsår från
              Bolagsverket.
            </p>
            <Input
              id="new-ar-orgnr"
              data-testid="new-arsredovisning-modal-orgnr"
              value={orgnr}
              disabled={busy}
              inputMode="numeric"
              placeholder="XXXXXX-XXXX"
              onChange={(e) => setOrgnr(e.target.value)}
            />
          </div>

          <div>
            <Label>Bokföringsimport (frivilligt)</Label>
            <p className="mb-2 text-sm text-ink-medium">
              Har du en SIE-fil från ditt bokföringssystem kan du importera den
              och få resultaträkningen, balansräkningen och delar av
              förvaltningsberättelsen ifyllda automatiskt. Kontrollera efteråt
              att fälten blev rätt.
            </p>
            <input
              ref={sieInputRef}
              type="file"
              accept=".se,.si,.sie"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleSieFile(file);
                e.target.value = "";
              }}
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => sieInputRef.current?.click()}
              >
                Välj SIE-fil…
              </Button>
              {sieFileName && (
                <span className="text-sm text-ink-medium">{sieFileName}</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            data-testid="new-arsredovisning-create"
            disabled={busy || !orgnrValid}
            onClick={() => void create()}
          >
            {busy ? "Vänta – arbetar…" : "Skapa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
