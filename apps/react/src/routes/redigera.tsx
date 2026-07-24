import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, FileCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { TodoPanel } from "@/edit/TodoPanel.tsx";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { PreviewPanel } from "@/render/PreviewPanel.tsx";
import { useAppBarSlot } from "@/components/AppBarSlot.tsx";
import { SaveDraftButton } from "@/components/SaveDraftButton.tsx";
import { EditGrunduppgifter } from "@/edit/sections/EditGrunduppgifter.tsx";
import { EditResultatrakning } from "@/edit/sections/EditResultatrakning.tsx";
import { EditBalansrakning } from "@/edit/sections/EditBalansrakning.tsx";
import { EditUnderskrifter } from "@/edit/sections/EditUnderskrifter.tsx";
import { EditNoter } from "@/edit/sections/EditNoter.tsx";
import { EditForvaltningsberattelse } from "@/edit/sections/EditForvaltningsberattelse.tsx";
import { NoterNavProvider } from "@/edit/noter/NoterNavContext.tsx";
import { NoterTreeSidebar } from "@/edit/noter/NoterTreeSidebar.tsx";
import { FinalizeWizardDialog } from "@/flows/finalize/FinalizeWizardDialog.tsx";
import { SendWizardDialog } from "@/flows/send/SendWizardDialog.tsx";

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
  const todoCount = arsredovisning?.gredorState.todoList.items.length ?? 0;
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].key);
  // Förhandsgranskningen är öppen från start — att se dokumentet växa fram är
  // hela poängen med editorn.
  const [previewOpen, setPreviewOpen] = useState(true);
  // Tom att-åtgärda-lista börjar hopfälld — annars äter den 320 px på tomma
  // "Allt klart!"-texten och trycker ihop redigeringsytan i onödan.
  const [todoCollapsed, setTodoCollapsed] = useState(todoCount === 0);
  // Notträdet startar hopfällt eftersom preview:n är öppen från start — samma
  // läge som när man själv slår på preview:n. Stänger man preview:n fälls det
  // ut igen (se autoCollapsed nedan).
  const [noterTreeCollapsed, setNoterTreeCollapsed] = useState(true);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  // Sidopanelerna fälls ihop automatiskt när preview:n öppnas (annars får
  // varken redigeringsytan eller preview:n plats), men bara om användaren inte
  // själv har ställt in dem — manuella val vinner alltid.
  const autoCollapsed = useRef({ todo: false, noterTree: true });
  const userSetTodo = useRef(false);
  const prevTodoCount = useRef(todoCount);

  const toggleTodoCollapsed = (collapsed: boolean) => {
    userSetTodo.current = true;
    autoCollapsed.current.todo = false;
    setTodoCollapsed(collapsed);
  };
  const toggleNoterTreeCollapsed = (collapsed: boolean) => {
    autoCollapsed.current.noterTree = false;
    setNoterTreeCollapsed(collapsed);
  };

  // Fäll ut listan när det dyker upp något att åtgärda (t.ex. efter SIE-import
  // eller en kontrollkörning) — men inte om användaren själv fällt ihop den.
  useEffect(() => {
    if (prevTodoCount.current === 0 && todoCount > 0 && !userSetTodo.current) {
      setTodoCollapsed(false);
    }
    prevTodoCount.current = todoCount;
  }, [todoCount]);

  const setPreviewOpenWithLayout = (open: boolean) => {
    setPreviewOpen(open);
    if (open) {
      // Kom ihåg vad vi själva fällde ihop, så vi kan fälla ut just det igen.
      autoCollapsed.current = {
        todo: !todoCollapsed,
        noterTree: !noterTreeCollapsed,
      };
      setTodoCollapsed(true);
      setNoterTreeCollapsed(true);
    } else {
      // Återställ bara det vi själva fällde ihop.
      if (autoCollapsed.current.todo) setTodoCollapsed(false);
      if (autoCollapsed.current.noterTree) setNoterTreeCollapsed(false);
      autoCollapsed.current = { todo: false, noterTree: false };
    }
  };

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
    <NoterNavProvider>
    <Tabs
      value={activeSection}
      onValueChange={setActiveSection}
      className="flex h-full flex-col gap-0"
    >
      {/* Sektionsflikarna och åtgärderna portaleras in i den delade appbaren, så
          editorn inte får en egen andra rad. Radix Tabs-kontexten följer med
          genom portalen till TabsContent i body:n nedan. Åtgärderna låg
          tidigare som FAB:ar, men de täckte formulärfälten i varje sektion. */}
      {appBarSlot &&
        createPortal(
          <>
            <SectionTabs activeSection={activeSection} />

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Button
                size="icon"
                variant={previewOpen ? "default" : "outline"}
                aria-label="Förhandsgranska"
                aria-pressed={previewOpen}
                title="Förhandsgranska"
                className="size-9"
                onClick={() => setPreviewOpenWithLayout(!previewOpen)}
              >
                <Eye />
              </Button>
              <SaveDraftButton />
              {/* Kort synlig etikett (appbaren rymmer inte de fulla), full
                  text som tillgängligt namn — den korta ryms i den långa, så
                  "label in name" håller. */}
              <Button
                size="sm"
                aria-label="Färdigställ inför årsstämma"
                title="Färdigställ inför årsstämma"
                onClick={() => setFinalizeOpen(true)}
              >
                <FileCheck /> Färdigställ
              </Button>
              <Button
                size="sm"
                variant="secondary"
                aria-label="Skicka in till Bolagsverket"
                title="Skicka in till Bolagsverket"
                onClick={() => setSendOpen(true)}
              >
                <Send /> Skicka in
              </Button>
            </div>
          </>,
          appBarSlot,
        )}

      {/* Delad yta: notträd (vänster, bara på noter-fliken) + redigeringspanel
          (enda scroll-containern) + preview + todo. */}
      <div className="flex min-h-0 flex-1">
        {activeSection === "noter" && (
          <NoterTreeSidebar
            collapsed={noterTreeCollapsed}
            onCollapsedChange={toggleNoterTreeCollapsed}
          />
        )}

        {/* 640 px är en *önskad* bredd (flex-basis), inte ett golv: den ger
            belopprad-tabellerna plats att rymmas utan horisontell scroll när
            preview:n är öppen, men får ge vika när allt inte får plats (t.ex.
            preview + utfälld todo-rail på ett smalt fönster). Ett hårt
            min-width sköt i stället ut todo-rail:en utanför skärmkanten.
            min-w-0 krävs för att flex ska tillåta krympning under
            innehållsbredden; tabellerna scrollar då i sig själva. */}
        <div className="relative min-h-0 min-w-0 grow shrink basis-[640px]">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-6 pb-10 pt-6">
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
        </div>

        <PreviewPanel open={previewOpen} arsredovisning={arsredovisning} />

        <TodoPanel
          collapsed={todoCollapsed}
          onCollapsedChange={toggleTodoCollapsed}
        />
      </div>

      <FinalizeWizardDialog open={finalizeOpen} onOpenChange={setFinalizeOpen} />
      <SendWizardDialog open={sendOpen} onOpenChange={setSendOpen} />
    </Tabs>
    </NoterNavProvider>
  );
}

function keepActiveTabVisible(scroller: HTMLElement) {
  scroller
    .querySelector('[data-state="active"]')
    ?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

/**
 * Sektionsflikarna i appbaren. På smala fönster blir listan bredare än den yta
 * appbaren kan ge den; då tonas den kant som döljer flikar ut så att det syns
 * att det finns mer att scrolla till, och den valda fliken hålls i sikte.
 */
function SectionTabs({ activeSection }: { activeSection: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const updateEdges = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft > 1, end: el.scrollLeft < max - 1 });
    };
    // Vid storleksändring kan den valda fliken hamna utanför synfältet.
    const observer = new ResizeObserver(() => {
      updateEdges();
      keepActiveTabVisible(el);
    });
    observer.observe(el);
    el.addEventListener("scroll", updateEdges, { passive: true });
    updateEdges();
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateEdges);
    };
  }, []);

  // Håll vald flik synlig när sektionen byts (t.ex. via tangentbord).
  useEffect(() => {
    if (scrollerRef.current) keepActiveTabVisible(scrollerRef.current);
  }, [activeSection]);

  const mask =
    edges.start || edges.end
      ? `linear-gradient(90deg, ${edges.start ? "transparent" : "#000"} 0, #000 24px, #000 calc(100% - 24px), ${edges.end ? "transparent" : "#000"} 100%)`
      : undefined;

  return (
    <div
      ref={scrollerRef}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      /* scroll-px-6 matchar toningens bredd, så en inscrollad flik hamnar
         innanför den i stället för under den. */
      className="min-w-0 overflow-x-auto scroll-px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <TabsList>
        {SECTIONS.map((section) => (
          <TabsTrigger
            key={section.key}
            value={section.key}
            data-testid={`section-tab-${section.key}`}
          >
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
