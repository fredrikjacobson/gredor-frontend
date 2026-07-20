import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { components } from "@/api/schema/gredor-backend-v1";
import { client } from "@/api/client.ts";

type BankIdStatusResponse = components["schemas"]["BankIdStatusResponse"];

export type BankIdStage =
  | "checkAuthStatus" // kollar om redan legitimerad
  | "showInfo" // visar info om legitimering
  | "loadingQrCode" // laddar QR-koden
  | "showQrCodeOrAuthResult" // visar QR-koden eller resultatet
  | "callFailure"; // anrop till BankID misslyckades

/**
 * Beslutar pollningsintervallet för BankID-statusen. Ren funktion så den kan
 * enhetstestas: polla var sekund tills vi fått ett icke-PENDING-svar (eller
 * flödet avbrutits).
 */
export function bankIdPollInterval(
  data: BankIdStatusResponse | null | undefined,
  aborted: boolean,
): number | false {
  if (aborted) return false;
  if (!data) return 1000; // inget/tranportfel än → fortsätt polla
  return data.status === "PENDING" ? 1000 : false;
}

/**
 * React-hook för BankID-inloggning — motsvarar Vue-appens useBankIdLoginApi.
 * Stegmaskinen ligger i useState; statuspollningen sköts av en TanStack
 * Query med refetchInterval (var sekund medan status är PENDING).
 */
export function useBankIdLogin(
  personalNumber: string,
  handlers?: {
    onApiError?: (message: string) => void;
    onException?: (error: Error) => void;
  },
) {
  const [stage, setStage] = useState<BankIdStage>("checkAuthStatus");
  const [authResult, setAuthResult] = useState<BankIdStatusResponse>();
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [autoStartToken, setAutoStartToken] = useState<string | null>(null);
  const abortedRef = useRef(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const { data, error } = await client.POST("/v1/auth/status", {
        body: { personalNumber },
        credentials: "include",
      });
      if (error) {
        handlers?.onApiError?.(String(error));
        setStage("callFailure");
      } else if (data?.loggedIn) {
        setAuthResult({ status: "COMPLETE" });
        setStage("showQrCodeOrAuthResult");
      } else {
        setStage("showInfo");
      }
    } catch (e) {
      if (e instanceof Error) handlers?.onException?.(e);
      setStage("callFailure");
    }
  }, [personalNumber, handlers]);

  const initLogin = useCallback(async () => {
    setStage("loadingQrCode");
    try {
      const { data, error } = await client.POST("/v1/bankid/init", {
        body: { personalNumber },
        credentials: "include",
      });
      if (error) {
        handlers?.onApiError?.(String(error));
        setStage("callFailure");
      } else if (data) {
        setAuthResult(data);
        setOrderRef(data.orderRef ?? null);
        setAutoStartToken(data.autoStartToken ?? null);
        setStage("showQrCodeOrAuthResult");
      }
    } catch (e) {
      if (e instanceof Error) handlers?.onException?.(e);
      setStage("callFailure");
    }
  }, [personalNumber, handlers]);

  const abortLogin = useCallback(() => {
    abortedRef.current = true;
  }, []);

  // Pollar BankID-statusen medan orderRef är satt och status är PENDING.
  const statusQuery = useQuery({
    queryKey: ["bankid-status", orderRef],
    enabled: orderRef != null && !abortedRef.current,
    gcTime: 0,
    refetchInterval: (query) =>
      bankIdPollInterval(query.state.data, abortedRef.current),
    queryFn: async (): Promise<BankIdStatusResponse | null> => {
      try {
        const { data, error } = await client.POST("/v1/bankid/status", {
          body: { orderRef: orderRef! },
          credentials: "include",
        });
        if (error || !data) return null; // fortsätt polla vid fel
        return data;
      } catch {
        return null; // fortsätt polla vid transportfel
      }
    },
  });

  useEffect(() => {
    if (statusQuery.data) setAuthResult(statusQuery.data);
  }, [statusQuery.data]);

  return {
    stage,
    authResult,
    autoStartLink: `bankid:///?autostarttoken=${autoStartToken}`,
    checkAuthStatus,
    initLogin,
    abortLogin,
  };
}
