import { useRef } from "react";
import { Upload } from "lucide-react";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { upgradeArsredovisningObject } from "@/model/arsredovisning/Arsredovisning.ts";
import { parseGredorFile } from "@/util/fileUtils.ts";
import { useFlowStore } from "@/stores/flowStore.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import { Button } from "@/components/ui/button.tsx";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/** Port av SendRequestFiles.vue — ladda upp .gredorfardig-filen. */
export function StepFiler({ goNext, cancel, stepNumber, numSteps }: SendStepProps) {
  const arsredovisning = useFlowStore((s) => s.arsredovisning);
  const setArsredovisning = useFlowStore((s) => s.setArsredovisning);
  const showMessageModal = useUiStore((s) => s.showMessageModal);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    try {
      const json = await file.text();
      const input = parseGredorFile<Arsredovisning>(json, [
        "arsredovisning_fardig",
      ]).data;
      upgradeArsredovisningObject(input);
      setArsredovisning(input);
    } catch {
      showMessageModal("Filen är ogiltig och kan inte öppnas i Gredor.", "Fel");
    }
  }

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Ladda upp filer
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".gredorfardig"
        className="hidden"
        data-testid="send-wizard-gredor-file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-4" /> Välj .gredorfardig-fil…
        </Button>
        {arsredovisning && (
          <span className="text-sm text-success">
            {arsredovisning.foretagsinformation.foretagsnamn || "Fil vald"} ✓
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-ink-medium">
        Filen ska du ha laddat ner i samband med att du färdigställde din
        årsredovisning inför årsstämman.
      </p>

      <WizardFooter
        previousHidden
        onCancel={cancel}
        onNext={goNext}
        nextDisabled={arsredovisning == null}
      />
    </div>
  );
}
