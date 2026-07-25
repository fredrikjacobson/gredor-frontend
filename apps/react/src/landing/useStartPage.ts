import { type RefObject, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import { hasAutosavedArsredovisning } from "@/stores/gredorStorage.ts";
import { exampleArsredovisning } from "@/templates/exampleArsredovisning.ts";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { upgradeArsredovisningObject } from "@/model/arsredovisning/Arsredovisning.ts";
import { parseGredorFile } from "@/util/fileUtils.ts";

/**
 * Startsidans ingångar, utan markup. Layoutvarianterna (src/landing/variants)
 * får ENBART det här objektet — ingen store, ingen navigering, ingen filinput
 * och ingen dialog. Därmed kan ingen variant råka flytta eller avmontera det
 * som e2e-testerna hänger på.
 */
export type StartPageActions = {
  /** Öppnar importguiden för en ny årsredovisning. */
  onNew: () => void;
  /** Klickar den dolda filinputen (.gredorutkast/.gredorfardig). */
  onOpenFile: () => void;
  /** Laddar exempelrapporten och går till editorn. */
  onExample: () => void;
  /** Går till editorn med det autosparade utkastet. */
  onResume: () => void;
  resumeAvailable: boolean;
  /** Företagsnamnet i utkastet, annars "Sparat utkast". */
  resumeLabel: string;
};

/** Allt som rutten (inte varianten) måste rendera för att e2e ska hålla. */
export type StartPageChromeProps = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelected: (file: File) => void;
  newDialogOpen: boolean;
  onNewDialogOpenChange: (open: boolean) => void;
  onCreated: (arsredovisning: Arsredovisning) => void;
};

export function useStartPage(): {
  actions: StartPageActions;
  chrome: StartPageChromeProps;
} {
  const navigate = useNavigate();
  const load = useArsredovisningStore((s) => s.load);
  const current = useArsredovisningStore((s) => s.arsredovisning);
  const showMessageModal = useUiStore((s) => s.showMessageModal);
  const resumeAvailable = hasAutosavedArsredovisning();
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAndEdit = (arsredovisning: Arsredovisning) => {
    load(arsredovisning);
    void navigate({ to: "/redigera" });
  };

  const openFile = async (file: File) => {
    try {
      const json = await file.text();
      const arsredovisning = parseGredorFile<Arsredovisning>(json, [
        "arsredovisning_utkast",
        "arsredovisning_fardig",
      ]).data;
      upgradeArsredovisningObject(arsredovisning);
      loadAndEdit(arsredovisning);
    } catch {
      showMessageModal("Filen är ogiltig och kan inte öppnas i Gredor.", "Fel");
    }
  };

  return {
    actions: {
      onNew: () => setNewDialogOpen(true),
      onOpenFile: () => fileInputRef.current?.click(),
      onExample: () => {
        load(structuredClone(exampleArsredovisning));
        void navigate({ to: "/redigera" });
      },
      onResume: () => void navigate({ to: "/redigera" }),
      resumeAvailable,
      resumeLabel:
        current?.foretagsinformation?.foretagsnamn || "Sparat utkast",
    },
    chrome: {
      fileInputRef,
      onFileSelected: (file) => void openFile(file),
      newDialogOpen,
      onNewDialogOpenChange: setNewDialogOpen,
      onCreated: (arsredovisning) => {
        setNewDialogOpen(false);
        loadAndEdit(arsredovisning);
      },
    },
  };
}
