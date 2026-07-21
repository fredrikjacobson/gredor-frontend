import { create } from "zustand";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";

/**
 * Runtime-tillstånd för skicka-in-flödet (`/skicka-in/$step`). Ersätter Vue-
 * appens `currentStep`-ref + step-lokala modeller. Den uppladdade .gredorfardig-
 * årsredovisningen, personnummer/e-post (persisteras i sessionStorage med samma
 * nycklar som Vue), den genererade iXBRL:en och BankID-status hålls här så att de
 * överlever navigering mellan de routade stegen.
 */

const PERSONAL_NUMBER_KEY = "UserPersonalNumber";
const NOTIFICATION_EMAIL_KEY = "UserNotificationEmail";

function readSession(key: string): string {
  try {
    return sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignorera (t.ex. privat läge)
  }
}

interface FlowState {
  /** Den uppladdade .gredorfardig-årsredovisningen som ska skickas in. */
  arsredovisning: Arsredovisning | null;
  personalNumber: string;
  notificationEmail: string;
  /** Genererad iXBRL (steg "generera"). */
  ixbrl: string | null;
  /** Om BankID-inloggningen är klar. */
  bankIdVerified: boolean;

  setArsredovisning: (arsredovisning: Arsredovisning) => void;
  setPersonalNumber: (value: string) => void;
  setNotificationEmail: (value: string) => void;
  setIxbrl: (ixbrl: string | null) => void;
  setBankIdVerified: (verified: boolean) => void;
  /** Nollställ flödet (behåller personnummer/e-post i sessionStorage). */
  reset: () => void;
}

export const useFlowStore = create<FlowState>((set) => ({
  arsredovisning: null,
  personalNumber: readSession(PERSONAL_NUMBER_KEY),
  notificationEmail: readSession(NOTIFICATION_EMAIL_KEY),
  ixbrl: null,
  bankIdVerified: false,

  setArsredovisning: (arsredovisning) => set({ arsredovisning }),
  setPersonalNumber: (value) => {
    writeSession(PERSONAL_NUMBER_KEY, value);
    set({ personalNumber: value });
  },
  setNotificationEmail: (value) => {
    writeSession(NOTIFICATION_EMAIL_KEY, value);
    set({ notificationEmail: value });
  },
  setIxbrl: (ixbrl) => set({ ixbrl }),
  setBankIdVerified: (bankIdVerified) => set({ bankIdVerified }),
  reset: () =>
    set({ arsredovisning: null, ixbrl: null, bankIdVerified: false }),
}));
