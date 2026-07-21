import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Circle, ListTodo, Send } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { ArsredovisningPreview } from "@/render/ArsredovisningPreview.tsx";
import { EditGrunduppgifter } from "@/edit/sections/EditGrunduppgifter.tsx";
import { EditResultatrakning } from "@/edit/sections/EditResultatrakning.tsx";
import { EditBalansrakning } from "@/edit/sections/EditBalansrakning.tsx";
import { EditUnderskrifter } from "@/edit/sections/EditUnderskrifter.tsx";

export const Route = createFileRoute("/redigera")({
  component: EditorPage,
});

const SECTIONS = [
  { key: "grunduppgifter", label: "Grunduppgifter" },
  { key: "forvaltningsberattelse", label: "Förvaltningsberättelse" },
  { key: "resultatrakning", label: "Resultaträkning" },
  { key: "balansrakning", label: "Balansräkning" },
  { key: "noter", label: "Noter" },
  { key: "underskrifter", label: "Underskrifter" },
] as const;

function EditorPage() {
  const navigate = useNavigate();
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  // Rendera om preview + fält när dokumentet redigeras in-place.
  useArsredovisningStore((s) => s.revision);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].key);

  if (!arsredovisning) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-3 text-xl font-semibold text-ink">
          Ingen årsredovisning öppen
        </h1>
        <p className="mb-6 text-ink-medium">
          Börja en ny årsredovisning eller öppna ett exempel från startsidan.
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Till startsidan</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      {/* Framstegsstegare — ersätter Vue-appens nav-tabs. Ingen dold
          accordion-struktur längre; varje sektion är ett steg. */}
      <ol className="mb-6 flex flex-wrap items-center gap-2">
        {SECTIONS.map((section, i) => {
          const active = section.key === activeSection;
          return (
            <li key={section.key}>
              <button
                onClick={() => setActiveSection(section.key)}
                className={
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors " +
                  (active
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface text-ink-medium hover:border-primary/50")
                }
              >
                {active ? (
                  <Circle className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4 opacity-40" />
                )}
                <span className="text-xs opacity-70">{i + 1}</span>
                {section.label}
              </button>
            </li>
          );
        })}
        <li>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate({ to: "/" })}
          >
            <Send className="size-4" /> Färdigställ &amp; skicka in
          </Button>
        </li>
      </ol>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_360px_320px]">
        {/* Redigeringspanel — platta, alltid synliga grupper med scrollspy. */}
        <div>
          {activeSection === "grunduppgifter" ? (
            <EditGrunduppgifter />
          ) : activeSection === "resultatrakning" ? (
            <EditResultatrakning />
          ) : activeSection === "balansrakning" ? (
            <EditBalansrakning />
          ) : activeSection === "underskrifter" ? (
            <EditUnderskrifter />
          ) : (
            <section className="rounded-lg border border-line bg-surface p-6 shadow-card">
              <h2 className="mb-1 text-lg font-semibold text-ink">
                {SECTIONS.find((s) => s.key === activeSection)?.label}
              </h2>
              <p className="text-sm text-ink-light">
                Den här sektionen porteras härnäst i fas 4 (belopprad-
                redigeringstabeller).
              </p>
            </section>
          )}
        </div>

        {/* Förhandsgranskning (A4) — live iXBRL-preview, uppdateras vid edit. */}
        <aside className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto rounded-lg border border-line bg-surface-medium p-2 shadow-card">
          <ArsredovisningPreview arsredovisning={arsredovisning} />
        </aside>

        {/* Att göra-panel — ersätter popover-baserade todo-listan. */}
        <aside className="sticky top-4 rounded-lg border border-line bg-surface p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2 font-medium text-ink">
            <ListTodo className="size-4 text-primary" /> Att göra
          </div>
          <p className="text-sm text-ink-light">
            Todo-panelen (SIE-varningar + Bolagsverkets kontroller) kopplas in i
            fas 4–5.
          </p>
        </aside>
      </div>
    </div>
  );
}
