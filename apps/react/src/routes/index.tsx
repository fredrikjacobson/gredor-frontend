import { type ReactNode, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  FilePlus2,
  FolderOpen,
  Leaf,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { BolagsverketLogo } from "@/components/BolagsverketLogo.tsx";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import { hasAutosavedArsredovisning } from "@/stores/gredorStorage.ts";
import { exampleArsredovisning } from "@/templates/exampleArsredovisning.ts";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { upgradeArsredovisningObject } from "@/model/arsredovisning/Arsredovisning.ts";
import { parseGredorFile } from "@/util/fileUtils.ts";
import { cn } from "@/lib/utils.ts";
import { NewArsredovisningDialog } from "@/components/NewArsredovisningDialog.tsx";

export const Route = createFileRoute("/")({
  component: StartPage,
});

function StartPage() {
  const navigate = useNavigate();
  const load = useArsredovisningStore((s) => s.load);
  const current = useArsredovisningStore((s) => s.arsredovisning);
  const showMessageModal = useUiStore((s) => s.showMessageModal);
  const resumeAvailable = hasAutosavedArsredovisning();
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const openFileInputRef = useRef<HTMLInputElement>(null);

  const openExample = () => {
    load(structuredClone(exampleArsredovisning));
    void navigate({ to: "/redigera" });
  };

  const loadAndEdit = (arsredovisning: Arsredovisning) => {
    load(arsredovisning);
    void navigate({ to: "/redigera" });
  };

  const openFile = async (file: File) => {
    try {
      const json = await file.text();
      const arsredovisning = parseGredorFile<Arsredovisning>(json, [
        "arsredovisning_utkast",
        "arsredovisning_fardig",
      ]).data;
      upgradeArsredovisningObject(arsredovisning);
      loadAndEdit(arsredovisning);
    } catch {
      showMessageModal("Filen är ogiltig och kan inte öppnas i Gredor.", "Fel");
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Mjuka dekorativa färgklickar bakom hjälten för en varmare känsla. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 -z-10 mx-auto h-96 max-w-5xl bg-[radial-gradient(60%_60%_at_30%_0%,color-mix(in_srgb,var(--color-primary)_16%,transparent),transparent),radial-gradient(50%_50%_at_85%_10%,color-mix(in_srgb,var(--color-secondary)_14%,transparent),transparent)] blur-2xl"
      />

      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center px-4 py-14">
        <div className="mb-10 text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary-dark">
            <BadgeCheck className="size-4" /> Helt gratis · godkänd av
            <BolagsverketLogo className="h-4 text-ink" />
          </span>
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-ink">
            Din årsredovisning,{" "}
            <span className="text-primary">utan krångel</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-medium">
            Gredor hjälper dig att ta fram en K2-årsredovisning för aktiebolag
            och skicka in den digitalt till Bolagsverket. Importera en SIE-fil
            eller börja från början.
          </p>
        </div>

        {resumeAvailable && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-card p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-ink">
                  Fortsätt där du slutade
                </div>
                <div className="text-sm text-ink-medium">
                  {current?.foretagsinformation?.foretagsnamn
                    ? current.foretagsinformation.foretagsnamn
                    : "Sparat utkast"}
                </div>
              </div>
              <Button onClick={() => navigate({ to: "/redigera" })}>
                Fortsätt
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <ActionCard
            icon={<FilePlus2 className="size-6" />}
            tone="primary"
            title="Ny årsredovisning"
            description="Börja från början eller importera en SIE-fil."
            actionLabel="Börja"
            onClick={() => setNewDialogOpen(true)}
          />
          <ActionCard
            icon={<FolderOpen className="size-6" />}
            tone="sky"
            title="Öppna fil"
            description="Fortsätt på en sparad .gredorutkast-fil."
            actionLabel="Öppna"
            onClick={() => openFileInputRef.current?.click()}
          />
          <ActionCard
            icon={<Sparkles className="size-6" />}
            tone="amber"
            title="Utforska exempel"
            description="Se en ifylld exempel-årsredovisning."
            actionLabel="Visa exempel"
            onClick={openExample}
          />
        </div>

        {/* Startsidan saknar header/footer, så det här är vägen till Om Gredor. */}
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border bg-card/60 p-6 text-center shadow-card sm:flex-row sm:text-left">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Leaf className="size-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-ink">Om Gredor</h2>
            <p className="mt-1 text-sm text-ink-medium">
              Gredor är ett kostnadsfritt, öppet verktyg – byggt av
              småföretagare för småföretagare. Läs mer om vad Gredor är, vad du
              bör tänka på och hur du kommer i kontakt med oss.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/om-gredor">
              Mer om Gredor <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <input
        ref={openFileInputRef}
        type="file"
        accept=".gredorutkast,.gredorfardig"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void openFile(file);
          e.target.value = "";
        }}
      />

      <NewArsredovisningDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        onCreated={(arsredovisning) => {
          setNewDialogOpen(false);
          loadAndEdit(arsredovisning);
        }}
      />
    </div>
  );
}

const TONE_CHIP: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  sky: "bg-[#00549a]/10 text-[#00549a]",
  amber: "bg-warning/15 text-[#b57f19]",
};

function ActionCard(props: {
  icon: ReactNode;
  tone: "primary" | "sky" | "amber";
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="group flex flex-col rounded-2xl border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-raised">
      <div
        className={cn(
          "mb-3 grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-105",
          TONE_CHIP[props.tone],
        )}
      >
        {props.icon}
      </div>
      <div className="font-semibold text-ink">{props.title}</div>
      <p className="mb-4 mt-1 flex-1 text-sm text-ink-medium">
        {props.description}
      </p>
      <Button variant="outline" onClick={props.onClick}>
        {props.actionLabel}
      </Button>
    </div>
  );
}
