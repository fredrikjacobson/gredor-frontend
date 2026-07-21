import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils.ts";

/**
 * Native <select> tematiserad mot Gredors semantiska tokens. Vue-appen använder
 * också native selects; en Radix-baserad shadcn Select tillför inget här och gör
 * option-listor (t.ex. valutor/avgivande) onödigt tunga. Kan uppgraderas till
 * Radix Select senare (endast två konsumenter).
 */
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      data-slot="select"
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-card transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
