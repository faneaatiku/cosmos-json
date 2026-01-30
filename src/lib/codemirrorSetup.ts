import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const cosmicHighlight = HighlightStyle.define([
  { tag: tags.string, color: "#a78bfa" },
  { tag: tags.number, color: "#fbbf24" },
  { tag: tags.bool, color: "#f472b6" },
  { tag: tags.null, color: "#64748b" },
  { tag: tags.propertyName, color: "#c4b5fd" },
  { tag: tags.punctuation, color: "#7c7cbe" },
]);

const cosmicTheme = EditorView.theme({
  "&": {
    color: "#e0e0f6",
    backgroundColor: "#0f0f2e",
  },
  ".cm-content": {
    caretColor: "#a78bfa",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#a78bfa",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "rgba(139, 92, 246, 0.25)",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(139, 92, 246, 0.08)",
  },
  ".cm-gutters": {
    backgroundColor: "#1a1a3e",
    color: "#5b5b9e",
    border: "none",
    borderRight: "1px solid #2a2a5e",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#2a2a5e",
  },
});

export function getCosmicExtensions(): Extension[] {
  return [
    cosmicTheme,
    syntaxHighlighting(cosmicHighlight),
    EditorView.lineWrapping,
  ];
}
