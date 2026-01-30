import { create } from "zustand";

interface EditorState {
  leftJson: string;
  rightJson: string;
  syncEditors: boolean;
  syncParsed: boolean;
  setLeftJson: (value: string) => void;
  setRightJson: (value: string) => void;
  toggleSyncEditors: () => void;
  toggleSyncParsed: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  leftJson: "",
  rightJson: "",
  syncEditors: false,
  syncParsed: false,
  setLeftJson: (value) => set({ leftJson: value }),
  setRightJson: (value) => set({ rightJson: value }),
  toggleSyncEditors: () => set((s) => ({ syncEditors: !s.syncEditors })),
  toggleSyncParsed: () => set((s) => ({ syncParsed: !s.syncParsed })),
}));
