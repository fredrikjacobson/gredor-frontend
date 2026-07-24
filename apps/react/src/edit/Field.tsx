import type { ReactNode } from "react";
import { Label } from "@/components/ui/label.tsx";

/**
 * Ett formulärfält med etikett i redigeringssektionerna.
 *
 * Bredden begränsas efter innehållet i stället för att fylla hela
 * redigeringsytan — ett organisationsnummer eller ett datum blir svårläst när
 * inmatningsfältet är tusen pixlar brett.
 */
const FIELD_WIDTH = {
  full: "",
  wide: "max-w-xl",
  medium: "max-w-md",
  narrow: "max-w-56",
} as const;

export type FieldWidth = keyof typeof FIELD_WIDTH;

export function Field({
  label,
  htmlFor,
  width = "medium",
  children,
}: {
  label: string;
  htmlFor?: string;
  width?: FieldWidth;
  children: ReactNode;
}) {
  return (
    <div className={FIELD_WIDTH[width]}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
