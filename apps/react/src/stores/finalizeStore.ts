import { create } from "zustand";

/**
 * Runtime-tillstånd för färdigställ-flödet (`/fardigstall/$step`). Till skillnad
 * från skicka-in-flödet arbetar detta mot den öppna årsredovisningen i
 * arsredovisningStore (inte en uppladdad fil). Här hålls valet att köra
 * Bolagsverkets kontroller (persisteras med samma nyckel som Vue,
 * "FinalizeCallBolagsverket", som ett wrappat värde), den genererade iXBRL:en
 * och nedladdningsstatus. Personnumret delas med skicka-in via sessionStorage
 * ("UserPersonalNumber").
 */

const CALL_BOLAGSVERKET_KEY = "FinalizeCallBolagsverket";
const PERSONAL_NUMBER_KEY = "UserPersonalNumber";

function readCallBolagsverket(): boolean | null {
  try {
    const raw = localStorage.getItem(CALL_BOLAGSVERKET_KEY);
    if (!raw) return null;
    // Vue lagrar { wrappedValue: boolean | null }.
    return (JSON.parse(raw) as { wrappedValue: boolean | null }).wrappedValue;
  } catch {
    return null;
  }
}

function writeCallBolagsverket(value: boolean | null): void {
  try {
    localStorage.setItem(
      CALL_BOLAGSVERKET_KEY,
      JSON.stringify({ wrappedValue: value }),
    );
  } catch {
    // ignorera
  }
}

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
    // ignorera
  }
}

interface FinalizeState {
  /** Kör Bolagsverkets kontroller? null = inte valt än. */
  callBolagsverket: boolean | null;
  personalNumber: string;
  /** Genererad iXBRL (steg "reminder"). */
  ixbrl: string | null;
  hasDownloadedGredorfardig: boolean;
  hasDownloadedPdf: boolean;

  setCallBolagsverket: (value: boolean | null) => void;
  setPersonalNumber: (value: string) => void;
  setIxbrl: (ixbrl: string | null) => void;
  setHasDownloadedGredorfardig: (value: boolean) => void;
  setHasDownloadedPdf: (value: boolean) => void;
  /** Nollställ flödet inför en ny körning (behåller persisterade val). */
  reset: () => void;
}

export const useFinalizeStore = create<FinalizeState>((set) => ({
  callBolagsverket: readCallBolagsverket(),
  personalNumber: readSession(PERSONAL_NUMBER_KEY),
  ixbrl: null,
  hasDownloadedGredorfardig: false,
  hasDownloadedPdf: false,

  setCallBolagsverket: (value) => {
    writeCallBolagsverket(value);
    set({ callBolagsverket: value });
  },
  setPersonalNumber: (value) => {
    writeSession(PERSONAL_NUMBER_KEY, value);
    set({ personalNumber: value });
  },
  setIxbrl: (ixbrl) => set({ ixbrl }),
  setHasDownloadedGredorfardig: (hasDownloadedGredorfardig) =>
    set({ hasDownloadedGredorfardig }),
  setHasDownloadedPdf: (hasDownloadedPdf) => set({ hasDownloadedPdf }),
  reset: () =>
    set({ ixbrl: null, hasDownloadedGredorfardig: false, hasDownloadedPdf: false }),
}));
