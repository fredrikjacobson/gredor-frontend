import { Button } from "@/components/ui/button.tsx";

/** Port av CommonWizardButtons.vue — Tillbaka / Avbryt / Nästa. */
export function WizardFooter({
  onPrevious,
  onNext,
  onCancel,
  nextDisabled,
  nextLabel = "Nästa",
  previousHidden,
}: {
  onPrevious?: () => void;
  onNext?: () => void;
  onCancel?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  previousHidden?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
      <div>
        {!previousHidden && onPrevious && (
          <Button variant="outline" onClick={onPrevious}>
            Tillbaka
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Avbryt
          </Button>
        )}
        {onNext && (
          <Button
            data-testid="wizard-next-button"
            onClick={onNext}
            disabled={nextDisabled}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
