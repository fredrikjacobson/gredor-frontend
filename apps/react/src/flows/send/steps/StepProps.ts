/** Gemensamt kontrakt för skicka-in-stegen (navigering + stegnummer). */
export interface SendStepProps {
  goNext: () => void;
  goPrevious: () => void;
  cancel: () => void;
  stepNumber: number;
  numSteps: number;
}
