import { type CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * shadcn/ui-Sonner-wrapper. Ljust tema (appen har inget mörkt läge). Färgerna
 * kopplas till Gredors semantiska tokens via CSS-variabler.
 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
