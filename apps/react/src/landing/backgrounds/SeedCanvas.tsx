import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils.ts";
import { usePrefersReducedMotion } from "@/landing/usePrefersReducedMotion.ts";

export type SeedCanvasProps = {
  /** Partiklar per 100 000 px². Skruva ner den här före något annat. */
  density?: number;
  /** Absolut tak oavsett skärmstorlek. */
  maxParticles?: number;
  /** Antal sparade positioner per frö = spårets längd. */
  trail?: number;
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  /** Ringbuffert med tidigare positioner: [x0,y0, x1,y1, …]. */
  history: number[];
  head: number;
  filled: number;
  speed: number;
  width: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
};

/** Gredors palett som "r,g,b" — alfat sätts per segment för uttoningen. */
const PALETTE: [string, number][] = [
  ["86,111,65", 0.5], // primary
  ["122,154,92", 0.45], // primary-light
  ["138,85,85", 0.38], // secondary
  ["201,146,46", 0.32], // warning
];

const SURFACE = "253,255,248"; // --color-surface
const FRAME_MS = 1000 / 30;
const STEP_S = FRAME_MS / 1000;

/**
 * Variant C: ett långsamt flödesfält av drivande frön.
 *
 * Spåren ritas som EGEN geometri varje bildruta ur en positionshistorik, i
 * stället för att låta halvgenomskinliga lager byggas upp över tid. Det kostar
 * några hundra korta streck extra per bildruta men gör bilden oberoende av hur
 * många bildrutor som hunnit köras — en enda målning ser likadan ut som efter
 * en minut. Det är också vad som gör den statiska varianten vid reducerad
 * rörelse (och en skärmdump i en vilande flik) till en riktig bild i stället
 * för ett dammoln.
 *
 * Prestandataket är medvetet lågt: 30 fps och DPR ≤ 2. Långsamt drivande frön
 * ser identiska ut vid 30 fps, och skillnaden är flera procentenheter CPU som
 * annars konkurrerar med iXBRL-genereringen i e2e-sviten.
 */
export function SeedCanvas({
  density = 8,
  maxParticles = 110,
  trail = 48,
  className,
}: SeedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Props läses genom en ref så simuleringen kan ligga i EN effekt med tomma
  // beroenden — annars sås fröna om vid varje justering.
  const settings = useRef({ density, maxParticles, trail });
  settings.current = { density, maxParticles, trail };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let last = 0;
    let time = 0;
    let resizeRaf = 0;
    const pointer = { x: -9999, y: -9999 };

    const seed = (into?: Particle): Particle => {
      const n = settings.current.trail;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const [color, alpha] =
        PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const p: Particle = {
        x,
        y,
        history: into?.history ?? new Array<number>(n * 2),
        head: 0,
        filled: 0,
        speed: 55 + Math.random() * 95,
        width: 0.9 + Math.random() * 2.4,
        life: 0,
        maxLife: 14 + Math.random() * 26,
        color,
        alpha,
      };
      if (p.history.length !== n * 2) p.history.length = n * 2;
      if (into) Object.assign(into, p);
      return into ?? p;
    };

    /** Mjukt, tidsvarierande flödesfält. Billigare än brustabeller och
     *  tillräckligt organiskt vid de här hastigheterna. */
    const angleAt = (x: number, y: number, t: number) =>
      (Math.sin(x * 0.0021 + t * 0.09) + Math.cos(y * 0.0017 - t * 0.07)) *
      Math.PI;

    const advance = (dt: number) => {
      time += dt;
      const n = settings.current.trail;

      for (const p of particles) {
        p.history[p.head * 2] = p.x;
        p.history[p.head * 2 + 1] = p.y;
        p.head = (p.head + 1) % n;
        if (p.filled < n) p.filled++;

        const a = angleAt(p.x, p.y, time);
        p.x += Math.cos(a) * p.speed * dt;
        p.y += Math.sin(a) * p.speed * dt;

        // Mjuk avstötning kring pekaren.
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = ((160 - d) / 160) * 45 * dt;
          p.x += (dx / d) * push;
          p.y += (dy / d) * push;
        }

        p.life += dt;
        if (
          p.life > p.maxLife ||
          p.x < -40 ||
          p.x > width + 40 ||
          p.y < -40 ||
          p.y > height + 40
        ) {
          seed(p);
        }
      }
    };

    /**
     * Spåret ritas som TVÅ polylinjer i stället för ett streck per segment:
     * hela svansen svagt och tunt, och den främre tredjedelen starkare och
     * tjockare ovanpå. Det ger uttoningen bakåt till priset av två stroke-anrop
     * per frö i stället för fyrtio — skillnaden är avgörande när spåren är
     * långa.
     */
    const strokeTrail = (
      p: Particle,
      from: number,
      alpha: number,
      lineWidth: number,
    ) => {
      const n = settings.current.trail;
      if (p.filled - from < 2) return;
      ctx.strokeStyle = `rgba(${p.color},${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      for (let i = from; i < p.filled; i++) {
        const idx = (p.head - p.filled + i + n * 2) % n;
        const x = p.history[idx * 2];
        const y = p.history[idx * 2 + 1];
        if (i === from) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    const render = () => {
      ctx.fillStyle = `rgb(${SURFACE})`;
      ctx.fillRect(0, 0, width, height);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const p of particles) {
        if (p.filled < 3) continue;
        strokeTrail(p, 0, p.alpha * 0.3, p.width * 0.55);
        strokeTrail(p, Math.floor(p.filled * 0.62), p.alpha, p.width);
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Panelen kan rapportera 0×0 innan första layouten; att sätta canvas till
      // 0 ger en blank yta som aldrig återhämtar sig.
      if (rect.width === 0 || rect.height === 0) return;

      const first = width === 0;
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // setTransform, inte scale(): scale() multipliceras ihop vid varje resize.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(
        settings.current.maxParticles,
        Math.max(
          24,
          Math.round(((width * height) / 100000) * settings.current.density),
        ),
      );
      // Återanvänd arrayen: en omsådd vid varje resize syns som ett hopp.
      if (particles.length > target) particles.length = target;
      while (particles.length < target) particles.push(seed());

      // Kör fältet en bit i förväg vid första uppmätningen så första målningen
      // redan har fullängdsspår i stället för punkter.
      if (first) {
        for (let i = 0; i < settings.current.trail + 4; i++) advance(STEP_S);
      }
      render();
    };

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      if (now - last < FRAME_MS) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      advance(dt);
      render();
    };

    const start = () => {
      if (raf || reducedMotion) return;
      // Nollställ tidsstämpeln: annars integreras hela pausen som ett enda dt
      // och samtliga frön teleporteras ut ur bild.
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    });
    observer.observe(canvas);
    resize();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    // Reducerad rörelse: en enda stillbild, aldrig någon rAF-loop.
    if (!reducedMotion) start();

    return () => {
      stop();
      cancelAnimationFrame(resizeRaf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      particles = [];
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // pointer-events-none är inte kosmetik: utan den täcker canvasen hela
      // viewporten och varje klick i e2e-sviten träffar den i stället.
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 size-full",
        className,
      )}
    />
  );
}
