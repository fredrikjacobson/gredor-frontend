/** Gemensamt kontrakt för färdigställ-stegen (navigering + stegnummer). */
export interface FinalizeStepProps {
  goNext: () => void;
  goPrevious: () => void;
  cancel: () => void;
  stepNumber: number;
  numSteps: number;
}
