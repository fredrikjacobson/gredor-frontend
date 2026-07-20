import { type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FilePlus2, FolderOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  useArsredovisningStore,
} from "@/stores/arsredovisningStore.ts";
import { hasAutosavedArsredovisning } from "@/stores/gredorStorage.ts";
import { exampleArsredovisning } from "@/templates/exampleArsredovisning.ts";

export const Route = createFileRoute("/")({
  component: StartPage,
});

function StartPage() {
  const navigate = useNavigate();
  const load = useArsredovisningStore((s) => s.load);
  const current = useArsredovisningStore((s) => s.arsredovisning);
  const resumeAvailable = hasAutosavedArsredovisning();

  const openExample = () => {
    load(structuredClone(exampleArsredovisning));
    void navigate({ to: "/redigera" });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-ink">
          Skapa din årsredovisning – helt gratis
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-medium">
          Gredor hjälper dig att ta fram en K2-årsredovisning för aktiebolag och
          skicka in den digitalt till Bolagsverket. Importera en SIE-fil eller
          börja från början.
        </p>
      </div>

      {resumeAvailable && (
        <div className="mb-8 rounded-lg border border-primary/40 bg-surface p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium text-ink">
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
          icon={<FilePlus2 className="size-6 text-primary" />}
          title="Ny årsredovisning"
          description="Börja från början eller importera en SIE-fil."
          actionLabel="Börja"
          onClick={() => navigate({ to: "/redigera" })}
        />
        <ActionCard
          icon={<FolderOpen className="size-6 text-primary" />}
          title="Öppna fil"
          description="Fortsätt på en sparad .gredorutkast-fil."
          actionLabel="Öppna"
          onClick={() => navigate({ to: "/redigera" })}
        />
        <ActionCard
          icon={<Sparkles className="size-6 text-primary" />}
          title="Utforska exempel"
          description="Se en ifylld exempel-årsredovisning."
          actionLabel="Visa exempel"
          onClick={openExample}
        />
      </div>
    </div>
  );
}

function ActionCard(props: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-line bg-surface p-5 shadow-card">
      <div className="mb-3">{props.icon}</div>
      <div className="font-medium text-ink">{props.title}</div>
      <p className="mb-4 mt-1 flex-1 text-sm text-ink-medium">
        {props.description}
      </p>
      <Button variant="outline" onClick={props.onClick}>
        {props.actionLabel}
      </Button>
    </div>
  );
}
