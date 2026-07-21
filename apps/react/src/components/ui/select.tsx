import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils.ts";

/**
 * Native <select> tematiserad mot Gredors palett. Vue-appen använder också
 * native selects; en Radix-baserad shadcn Select tillför inget här och gör
 * option-listor (t.ex. valutor/avgivande) onödigt tunga.
 */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-line bg-surface-input px-3 py-2 text-sm text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
