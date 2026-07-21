import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils.ts";

/** shadcn/ui-stil Input, tematiserad mot Gredors palett. */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-line bg-surface-input px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
