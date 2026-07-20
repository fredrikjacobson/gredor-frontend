import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useUiStore } from "@/stores/uiStore.ts";

/**
 * Renderar den översta kö-lagda meddelandemodalen — motsvarar Vue-appens
 * AppModalController + useModalStore. Nästa modal visas när den nuvarande
 * stängs (LIFO, som Vue-varianten).
 */
export function ModalHost() {
  const modalDefinitions = useUiStore((s) => s.modalDefinitions);
  const popTopModalDefinition = useUiStore((s) => s.popTopModalDefinition);

  const top = modalDefinitions[modalDefinitions.length - 1];

  return (
    <Dialog
      open={top != null}
      onOpenChange={(open) => {
        if (!open) popTopModalDefinition();
      }}
    >
      {top && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{top.title ?? "Meddelande"}</DialogTitle>
            <DialogDescription className="whitespace-pre-wrap">
              {top.text}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={popTopModalDefinition}>OK</Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
