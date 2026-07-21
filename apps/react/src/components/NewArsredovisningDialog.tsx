import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileCheck2 } from "lucide-react";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { createArsredovisningFromTemplate } from "@/model/arsredovisning/Arsredovisning.ts";
import { starterArsredovisning } from "@/templates/starterArsredovisning.ts";
import {
  mapSieFileIntoArsredovisning,
  parseSieHeader,
} from "@/util/sieUtils.ts";
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
import { cn } from "@/lib/utils.ts";

const STEPS = ["SIE-import", "Företagsuppgifter"] as const;

/**
 * Importguide för en ny årsredovisning. Steg 1 (frivilligt) importerar en
 * SIE-fil: RR/BR + delar av förvaltningsberättelsen förfylls, och
 * organisationsnumret läses ur filens #ORGNR. Steg 2 bekräftar orgnr (namn +
 * räkenskapsår hämtas från Bolagsverket). SIE-resultatet visas i guiden i
 * stället för i separata modaler.
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
  const [step, setStep] = useState(0);
  const [orgnr, setOrgnr] = useState("");
  const [orgnrFromSie, setOrgnrFromSie] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sieMessages, setSieMessages] = useState<string[]>([]);
  const [sieFileName, setSieFileName] = useState("");
  const sieInputRef = useRef<HTMLInputElement>(null);

  const orgnrValid = /^\d{10}$/.test(orgnr.replace("-", ""));

  // Nollställ guiden varje gång den öppnas.
  useEffect(() => {
    if (!open) return;
    arRef.current = createArsredovisningFromTemplate(starterArsredovisning);
    setStep(0);
    setOrgnr("");
    setOrgnrFromSie(false);
    setSieMessages([]);
    setSieFileName("");
  }, [open]);

  async function handleSieFile(file: File) {
    setBusy(true);
    try {
      const text = await file.text();
      const header = parseSieHeader(text);

      // Nollställ mallen och förfyll orgnr/namn ur SIE-filens huvudposter.
      arRef.current = createArsredovisningFromTemplate(starterArsredovisning);
      const parsedOrgnr = header.orgnr ?? orgnr;
      arRef.current.foretagsinformation.organisationsnummer =
        parsedOrgnr.trim();
      if (header.foretagsnamn) {
        arRef.current.foretagsinformation.foretagsnamn = header.foretagsnamn;
      }
      if (header.orgnr) {
        setOrgnr(header.orgnr);
        setOrgnrFromSie(true);
      }

      const messages: string[] = [];
      await mapSieFileIntoArsredovisning(text, arRef.current, (m) =>
        messages.push(m),
      );
      setSieMessages(messages);
      setSieFileName(file.name);
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
          type: "import",
          title: "Varningar från SIE-import",
          description:
            "Följande varningar uppstod när du importerade din SIE-fil.",
          timestamp: Date.now(),
          tasks: sieMessages.map((message) => ({
            text: message,
            complete: false,
          })),
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

        {/* Stegindikator */}
        <ol className="flex items-center gap-2 text-xs font-medium">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full text-[11px]",
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-ink-light",
                )}
              >
                {i + 1}
              </span>
              <span className={i === step ? "text-ink" : "text-ink-light"}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="mx-1 h-px w-6 bg-line" />
              )}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <div className="space-y-4">
            <div>
              <Label>Importera bokföring (frivilligt)</Label>
              <p className="mt-1 text-sm text-ink-medium">
                Har du en SIE-fil från ditt bokföringssystem kan du importera
                den för att få resultaträkningen, balansräkningen och delar av
                förvaltningsberättelsen ifyllda automatiskt. Organisationsnumret
                fylls i från filen. Kontrollera efteråt att fälten blev rätt.
              </p>
            </div>

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
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => sieInputRef.current?.click()}
            >
              {busy ? "Läser filen…" : "Välj SIE-fil…"}
            </Button>

            {sieFileName && !busy && (
              <div className="rounded-lg border bg-surface p-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-ink">
                  <FileCheck2 className="size-4 text-primary" />
                  {sieFileName}
                </div>
                {sieMessages.length === 0 ? (
                  <p className="mt-2 flex items-center gap-1.5 text-success">
                    <CheckCircle2 className="size-4" />
                    Importen lyckades utan varningar.
                  </p>
                ) : (
                  <div className="mt-2">
                    <p className="flex items-center gap-1.5 font-medium text-warning">
                      <AlertTriangle className="size-4" />
                      {sieMessages.length} varning
                      {sieMessages.length === 1 ? "" : "ar"}
                    </p>
                    <ul className="mt-1 max-h-40 list-disc space-y-0.5 overflow-y-auto pl-5 text-xs text-ink-medium">
                      {sieMessages.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-ink-light">
                      Varningarna hamnar även i din att-åtgärda-lista.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="new-ar-orgnr">Organisationsnummer</Label>
            <p className="text-sm text-ink-medium">
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
              onChange={(e) => {
                setOrgnr(e.target.value);
                setOrgnrFromSie(false);
              }}
            />
            {orgnrFromSie && (
              <p className="flex items-center gap-1.5 text-xs text-success">
                <CheckCircle2 className="size-3.5" />
                Ifyllt från SIE-filen.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 0 ? (
            <Button
              data-testid="new-arsredovisning-next"
              disabled={busy}
              onClick={() => setStep(1)}
            >
              {sieFileName ? "Nästa" : "Hoppa över import"}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setStep(0)}
              >
                Tillbaka
              </Button>
              <Button
                data-testid="new-arsredovisning-create"
                disabled={busy || !orgnrValid}
                onClick={() => void create()}
              >
                {busy ? "Vänta – arbetar…" : "Skapa"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
