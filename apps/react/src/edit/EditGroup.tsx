import { type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

/**
 * En platt, alltid synlig grupp i redigeraren — ersätter Vue-appens
 * CommonAccordionItem (kollapsad som standard). Bygger på shadcn Card. Titeln är
 * ett scrollspy-ankare (`id`) som undernavigeringen länkar till.
 */
export function EditGroup({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card
      id={id}
      // scroll-mt: kompensera för den sticky chip-navigeringen vid ankarhopp.
      className="scroll-mt-20 gap-4 py-5"
    >
      <CardHeader className="px-5">
        <CardTitle className="text-base font-semibold text-ink">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5">{children}</CardContent>
    </Card>
  );
}
