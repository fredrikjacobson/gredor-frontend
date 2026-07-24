import { Download } from "lucide-react";
import { toast } from "sonner";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import type { DataContainer } from "@/model/DataContainer.ts";
import { requestSaveFile } from "@/util/fileUtils.ts";
import { formatDateForFilename } from "@/util/formatUtils.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { Button } from "@/components/ui/button.tsx";

/**
 * Sparar det öppna utkastet som en .gredorutkast-fil (port av exportFile i
 * Vue-appens AppHeader.vue, som tappades bort i React-porten). Filen kan öppnas
 * igen från startsidan ("Öppna fil").
 */
export function SaveDraftButton() {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);

  const saveDraft = () => {
    if (!arsredovisning) return;
    const container: DataContainer<Arsredovisning> = {
      dataType: "arsredovisning_utkast",
      version: 1,
      data: arsredovisning,
    };
    const filename = `Arsredovisning_${formatDateForFilename(new Date())}.gredorutkast`;
    requestSaveFile(JSON.stringify(container), filename, "application/json");
    toast.success("Utkastet sparades", { description: filename });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-9"
      onClick={saveDraft}
      disabled={!arsredovisning}
      data-testid="save-draft"
      aria-label="Spara utkast som .gredorutkast-fil"
      title="Spara utkast som .gredorutkast-fil"
    >
      <Download className="size-4" />
    </Button>
  );
}
