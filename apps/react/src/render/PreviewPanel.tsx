import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { ArsredovisningPreview } from "@/render/ArsredovisningPreview.tsx";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { cn } from "@/lib/utils.ts";

/** A4-bredd i px vid 96 dpi (210 mm) — samma fasta bredd som render.scss. */
const A4_WIDTH = 794;
const MIN_SCALE = 0.25;
const MAX_SCALE = 2;

/**
 * Förhandsgranskning som en dockad, animerad sidopanel (glider in/ut med en
 * bredd-transition). Dold som standard; öppnas från appbarens öga-knapp. Hela
 * A4-dokumentet skalas för att passa panelens bredd (eller vald zoom) och
 * scrollar i EN container. `.preview-overlay`-klassen av-klipper
 * .arsredovisning-root (se app.css) så dokumentet kan flöda fritt. Preview:n
 * monteras först när panelen öppnats och behålls sedan (undviker att rendera om
 * hela dokumentet vid varje toggle).
 */
export function PreviewPanel({
  open,
  arsredovisning,
}: {
  open: boolean;
  arsredovisning: Arsredovisning;
}) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [availWidth, setAvailWidth] = useState(A4_WIDTH);
  const [naturalHeight, setNaturalHeight] = useState(0);
  // null = anpassa till bredd; ett tal = explicit zoomnivå.
  const [zoom, setZoom] = useState<number | null>(null);
  // null = använd standardbredd; ett tal = användarens dragna bredd i px.
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  const remeasure = () => {
    if (scrollRef.current) setAvailWidth(scrollRef.current.clientWidth);
    if (contentRef.current) setNaturalHeight(contentRef.current.scrollHeight);
  };

  // Bredd/höjd mäts fel om ResizeObservern missar slutbredden medan panelen
  // glider in (mättes ibland vid min-bredden → för liten skala + avklippt
  // dokument). Mät om när öppningsanimationen (300 ms) har lagt sig.
  useEffect(() => {
    if (!open) return;
    const timers = [setTimeout(remeasure, 120), setTimeout(remeasure, 360)];
    return () => timers.forEach(clearTimeout);
  }, [open]);

  // Mät tillgänglig bredd (uppdateras mjukt medan panelen animerar).
  useEffect(() => {
    if (!mounted) return;
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setAvailWidth(el.clientWidth);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [mounted]);

  // Mät dokumentets naturliga (oskalade) höjd så scrollytan blir rätt.
  useEffect(() => {
    if (!mounted) return;
    const el = contentRef.current;
    if (!el) return;
    const update = () => setNaturalHeight(el.scrollHeight);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [mounted]);

  const fitScale = Math.min(1, Math.max(0.1, (availWidth - 32) / A4_WIDTH));
  const scale = zoom ?? fitScale;
  const percent = Math.round(scale * 100);

  const nudge = (delta: number) =>
    setZoom(() =>
      Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, Number((scale + delta).toFixed(2))),
      ),
    );

  // Dra i vänsterkanten för att justera delningen mellan editor och preview.
  const startResize = (e: ReactPointerEvent) => {
    e.preventDefault();
    const rightX = panelRef.current?.getBoundingClientRect().right ?? 0;
    setDragging(true);
    const onMove = (ev: PointerEvent) => {
      const w = Math.max(
        380,
        Math.min(window.innerWidth * 0.75, rightX - ev.clientX),
      );
      setDragWidth(w);
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={panelRef}
      aria-hidden={!open}
      onTransitionEnd={remeasure}
      style={
        open && dragWidth != null ? { width: `${dragWidth}px` } : undefined
      }
      className={cn(
        "relative flex flex-col overflow-hidden border-l bg-surface-medium max-md:hidden",
        !dragging && "transition-[width] duration-300 ease-in-out",
        // Öppen panel får krympa (men aldrig under sin min-bredd) så att
        // redigeringsytans önskade bredd vinner i stället för att raden svämmar
        // över på smalare fönster.
        open
          ? dragWidth != null
            ? "min-w-[380px]"
            : "w-[40%] min-w-[380px] max-w-[620px]"
          : "w-0 shrink-0",
      )}
    >
      {/* Dra-handtag för att ändra delningen. */}
      {open && (
        <div
          onPointerDown={startResize}
          title="Dra för att ändra bredd"
          className="group absolute inset-y-0 left-0 z-10 flex w-2 cursor-col-resize items-stretch justify-center"
        >
          <span
            className={cn(
              "w-0.5 transition-colors",
              dragging
                ? "bg-primary"
                : "bg-transparent group-hover:bg-primary/40",
            )}
          />
        </div>
      )}
      <div className="flex h-full w-full min-w-[380px] flex-col">
        <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2">
          {/* Rubriken får kortas av när panelen är som smalast — zoom- och
              anpassa-kontrollerna ska aldrig klippas bort. */}
          <span className="min-w-0 truncate text-sm font-medium text-ink">
            Förhandsgranskning
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              aria-label="Zooma ut"
              onClick={() => nudge(-0.1)}
            >
              <Minus />
            </Button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="min-w-14 rounded-md px-2 py-1 text-sm tabular-nums text-ink-medium hover:bg-accent"
              title="Återställ till 100 %"
            >
              {percent} %
            </button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              aria-label="Zooma in"
              onClick={() => nudge(0.1)}
            >
              <Plus />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="ml-1"
              onClick={() => setZoom(null)}
            >
              <Maximize2 /> Anpassa
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto p-4">
          {mounted && (
            <div
              style={{
                width: A4_WIDTH * scale,
                height: naturalHeight ? naturalHeight * scale : undefined,
                margin: "0 auto",
                overflow: "hidden",
              }}
            >
              <div
                ref={contentRef}
                className="preview-overlay"
                style={{
                  width: A4_WIDTH,
                  transformOrigin: "top left",
                  transform: `scale(${scale})`,
                }}
              >
                <ArsredovisningPreview arsredovisning={arsredovisning} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
