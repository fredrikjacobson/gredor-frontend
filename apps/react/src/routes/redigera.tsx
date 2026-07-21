import { useState } from "react";
import { createPortal } from "react-dom";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, FileCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { TodoPanel } from "@/edit/TodoPanel.tsx";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { PreviewPanel } from "@/render/PreviewPanel.tsx";
import { useAppBarSlot } from "@/components/AppBarSlot.tsx";
import { EditGrunduppgifter } from "@/edit/sections/EditGrunduppgifter.tsx";
import { EditResultatrakning } from "@/edit/sections/EditResultatrakning.tsx";
import { EditBalansrakning } from "@/edit/sections/EditBalansrakning.tsx";
import { EditUnderskrifter } from "@/edit/sections/EditUnderskrifter.tsx";
import { EditNoter } from "@/edit/sections/EditNoter.tsx";
import { EditForvaltningsberattelse } from "@/edit/sections/EditForvaltningsberattelse.tsx";

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
  const appBarSlot = useAppBarSlot();
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].key);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [todoCollapsed, setTodoCollapsed] = useState(false);

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
    <Tabs
      value={activeSection}
      onValueChange={setActiveSection}
      className="flex h-full flex-col gap-0"
    >
      {/* Sektionsflikarna portaleras in i den delade appbaren, så editorn inte
          får en egen andra rad. Radix Tabs-kontexten följer med genom portalen
          till TabsContent i body:n nedan. Åtgärderna ligger som FAB:ar. */}
      {appBarSlot &&
        createPortal(
          <TabsList className="min-w-0 max-w-full overflow-x-auto">
            {SECTIONS.map((section) => (
              <TabsTrigger
                key={section.key}
                value={section.key}
                data-testid={`section-tab-${section.key}`}
              >
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>,
          appBarSlot,
        )}

      {/* Delad yta: redigeringspanel (enda scroll-containern) + preview + todo. */}
      <div className="flex min-h-0 flex-1">
        {/* Relativ wrapper så FAB:arna flyter över redigeringsytan (inte över
            todo-rail:en) och står stilla medan innehållet scrollar. */}
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-6 pb-28 pt-6">
              <TabsContent value="grunduppgifter">
                <EditGrunduppgifter />
              </TabsContent>
              <TabsContent value="forvaltningsberattelse">
                <EditForvaltningsberattelse />
              </TabsContent>
              <TabsContent value="resultatrakning">
                <EditResultatrakning />
              </TabsContent>
              <TabsContent value="balansrakning">
                <EditBalansrakning />
              </TabsContent>
              <TabsContent value="noter">
                <EditNoter />
              </TabsContent>
              <TabsContent value="underskrifter">
                <EditUnderskrifter />
              </TabsContent>
            </div>
          </div>

          {/* Flytande åtgärdsknappar (FAB:ar). */}
          <div className="pointer-events-none absolute bottom-6 right-6 z-30 flex flex-col items-end gap-3">
            <Button
              size="icon"
              variant={previewOpen ? "default" : "outline"}
              aria-label="Förhandsgranska"
              aria-pressed={previewOpen}
              className="pointer-events-auto size-12 rounded-full shadow-raised"
              onClick={() => setPreviewOpen((v) => !v)}
            >
              <Eye className="size-5" />
            </Button>
            <Button
              className="pointer-events-auto h-12 rounded-full px-5 shadow-raised"
              onClick={() =>
                navigate({
                  to: "/fardigstall/$step",
                  params: { step: "paminnelse" },
                })
              }
            >
              <FileCheck /> Färdigställ inför årsstämma
            </Button>
            <Button
              variant="secondary"
              className="pointer-events-auto h-12 rounded-full px-5 shadow-raised"
              onClick={() =>
                navigate({ to: "/skicka-in/$step", params: { step: "filer" } })
              }
            >
              <Send /> Skicka in till Bolagsverket
            </Button>
          </div>
        </div>

        <PreviewPanel open={previewOpen} arsredovisning={arsredovisning} />

        <TodoPanel
          collapsed={todoCollapsed}
          onCollapsedChange={setTodoCollapsed}
        />
      </div>
    </Tabs>
  );
}
