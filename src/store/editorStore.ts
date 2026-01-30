import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EditorState {
  leftJson: string;
  rightJson: string;
  syncEditors: boolean;
  syncParsed: boolean;
  leftPercent: number;
  editorHeight: number;
  parsedHeight: number;
  setLeftJson: (value: string) => void;
  setRightJson: (value: string) => void;
  toggleSyncEditors: () => void;
  toggleSyncParsed: () => void;
  setLeftPercent: (value: number) => void;
  setEditorHeight: (value: number) => void;
  setParsedHeight: (value: number) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      leftJson: "",
      rightJson: "",
      syncEditors: false,
      syncParsed: false,
      leftPercent: 50,
      editorHeight: 300,
      parsedHeight: 300,
      setLeftJson: (value) => set({ leftJson: value }),
      setRightJson: (value) => set({ rightJson: value }),
      toggleSyncEditors: () => set((s) => ({ syncEditors: !s.syncEditors })),
      toggleSyncParsed: () => set((s) => ({ syncParsed: !s.syncParsed })),
      setLeftPercent: (value) => set({ leftPercent: value }),
      setEditorHeight: (value) => set({ editorHeight: value }),
      setParsedHeight: (value) => set({ parsedHeight: value }),
    }),
    {
      name: "cosmos-json-editor",
    },
  ),
);
