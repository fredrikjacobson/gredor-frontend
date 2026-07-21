import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [availWidth, setAvailWidth] = useState(A4_WIDTH);
  const [naturalHeight, setNaturalHeight] = useState(0);
  // null = anpassa till bredd; ett tal = explicit zoomnivå.
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    if (open) setMounted(true);
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

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-l bg-surface-medium transition-[width] duration-300 ease-in-out",
        open ? "w-[46%] min-w-[380px] max-w-[680px]" : "w-0",
      )}
    >
      <div className="flex h-full w-full min-w-[380px] flex-col">
        <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2">
          <span className="text-sm font-medium text-ink">Förhandsgranskning</span>
          <div className="flex items-center gap-1">
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
