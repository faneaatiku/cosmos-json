import { create } from "zustand";

interface EditorState {
  leftJson: string;
  rightJson: string;
  setLeftJson: (value: string) => void;
  setRightJson: (value: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  leftJson: "",
  rightJson: "",
  setLeftJson: (value) => set({ leftJson: value }),
  setRightJson: (value) => set({ rightJson: value }),
}));
