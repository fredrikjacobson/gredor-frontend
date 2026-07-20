import { create } from "zustand";

export interface ModalDefinition {
  id: number;
  title?: string;
  text: string;
}

interface UiState {
  modalDefinitions: ModalDefinition[];
  todoPanelOpen: boolean;
  showMessageModal: (text: string, title?: string) => void;
  popTopModalDefinition: () => void;
  setTodoPanelOpen: (open: boolean) => void;
}

let nextId = 0;

/** Motsvarar Vue-appens useModalStore + lite övrig UI-status (todo-panel). */
export const useUiStore = create<UiState>((set) => ({
  modalDefinitions: [],
  todoPanelOpen: true,
  showMessageModal: (text, title) =>
    set((state) => ({
      modalDefinitions: [
        ...state.modalDefinitions,
        { id: ++nextId, title, text },
      ],
    })),
  popTopModalDefinition: () =>
    set((state) => ({
      modalDefinitions: state.modalDefinitions.slice(0, -1),
    })),
  setTodoPanelOpen: (open) => set({ todoPanelOpen: open }),
}));
