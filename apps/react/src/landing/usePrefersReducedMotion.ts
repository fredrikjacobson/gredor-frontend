import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Följer prefers-reduced-motion löpande (inte bara vid montering) så att en
 * ändring i systeminställningarna slår igenom direkt.
 *
 * I dev kan `?motion=off` tvinga fram det reducerade läget, så de statiska
 * fallbacken går att skärmdumpa utan att röra systeminställningarna.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    if (
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search).get("motion") === "off"
    ) {
      return true;
    }
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search).get("motion") === "off"
    ) {
      setReduced(true);
      // Rena CSS-animationer (variant B:s färgfält) ser inte hooken — de
      // stängs av via en attributselektor i landing.css.
      document.documentElement.setAttribute("data-gredor-motion", "off");
      return () =>
        document.documentElement.removeAttribute("data-gredor-motion");
    }
    const media = window.matchMedia(QUERY);
    const onChange = () => setReduced(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
