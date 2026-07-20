import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui-standard: slår ihop klassnamn och löser Tailwind-konflikter. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
