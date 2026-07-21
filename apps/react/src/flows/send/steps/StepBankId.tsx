import { useEffect } from "react";
import { useFlowStore } from "@/stores/flowStore.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import { useBankIdLogin } from "@/api/useBankIdLogin.ts";
import { Button } from "@/components/ui/button.tsx";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/**
 * Port av CommonBankIdLogin.vue — legitimering med BankID via useBankIdLogin
 * (stegmaskin + statuspollning). Vid COMPLETE markeras flödet som legitimerat.
 */
export function StepBankId({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  const personalNumber = useFlowStore((s) => s.personalNumber);
  const setBankIdVerified = useFlowStore((s) => s.setBankIdVerified);
  const showMessageModal = useUiStore((s) => s.showMessageModal);

  const { stage, authResult, autoStartLink, checkAuthStatus, initLogin, abortLogin } =
    useBankIdLogin(personalNumber, {
      onApiError: (message) =>
        showMessageModal(message, "Fel vid BankID-legitimering"),
      onException: (error) =>
        showMessageModal(
          `Teknisk information: ${error.message}`,
          "Fel vid BankID-legitimering",
        ),
    });

  useEffect(() => {
    // (fördröjning så "Laddar…" hinner visas)
    const timer = setTimeout(() => void checkAuthStatus(), 250);
    return () => {
      clearTimeout(timer);
      abortLogin();
    };
    // Kör bara vid montering; checkAuthStatus/abortLogin är stabila callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complete = authResult?.status === "COMPLETE";

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Legitimera med BankID
      </p>

      {stage === "checkAuthStatus" && <div>Laddar…</div>}

      {(stage === "showInfo" || stage === "loadingQrCode") && (
        <div className="space-y-3 text-sm text-ink-medium">
          <p>
            Legitimering krävs vid kommunikation med Bolagsverket, för att visa
            att du är den som du uppger dig för att vara.
          </p>
          <p>
            Obs: I syfte att förhindra spam tillåter vi maximalt 10
            legitimeringar per person och vecka. Ditt personnummer kommer att
            sparas på Gredors servrar i 7 dygn dels för att vi ska kunna
            kontrollera detta, och dels så att du under denna period inte ska
            behöva legitimera dig på nytt varje gång.
          </p>
          <div className="flex items-center justify-center py-4">
            <Button
              disabled={stage === "loadingQrCode"}
              onClick={() => void initLogin()}
              data-testid="send-wizard-bankid-init"
            >
              {stage === "loadingQrCode"
                ? "Laddar…"
                : "Starta legitimering med BankID"}
            </Button>
          </div>
        </div>
      )}

      {stage === "callFailure" && (
        <div className="text-sm text-danger">
          Något gick fel vid kommunikation med BankID. Prova att gå tillbaka ett
          steg och sedan försöka igen.
        </div>
      )}

      {stage === "showQrCodeOrAuthResult" && (
        <div>
          {authResult?.status === "PENDING" &&
            authResult.statusPendingData != null && (
              <div className="flex flex-col items-center justify-center gap-3 pt-3">
                <img
                  src={authResult.statusPendingData.qrCodeImageBase64}
                  alt="QR-kod för BankID"
                />
                <p className="text-center text-sm">
                  Skanna QR-koden ovan med BankID-appen på din mobila enhet.
                </p>
                {autoStartLink && (
                  <p className="text-center text-sm">
                    <a className="font-bold text-primary" href={autoStartLink}>
                      Öppna BankID på denna enhet
                    </a>
                  </p>
                )}
              </div>
            )}
          {authResult?.status === "COMPLETE" && (
            <div className="text-sm text-success" data-testid="send-wizard-bankid-complete">
              Du är legitimerad.
            </div>
          )}
          {authResult?.status === "FAILED" && (
            <div className="text-sm text-danger">
              Något gick fel vid legitimering. Prova att gå tillbaka ett steg och
              sedan försöka igen.
            </div>
          )}
        </div>
      )}

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={() => {
          setBankIdVerified(true);
          goNext();
        }}
        nextDisabled={!complete}
      />
    </div>
  );
}
