import * as LabelPrimitive from "@radix-ui/react-label";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils.ts";

/**
 * shadcn/ui-Label över Radix. Behåller `mb-1.5 block` så befintliga
 * fält-layouter (label ovanför input) får sitt mellanrum utan wrapper.
 */
export function Label({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "mb-1.5 block text-sm font-medium text-foreground select-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
