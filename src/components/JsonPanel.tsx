import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { getCosmicExtensions } from "../lib/codemirrorSetup";
import { useMemo } from "react";

interface JsonPanelProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
}

export default function JsonPanel({ label, value, onChange, children }: JsonPanelProps) {
  const extensions = useMemo(() => [json(), ...getCosmicExtensions()], []);

  return (
    <div className="flex-1 flex flex-col min-w-0 gap-2">
      <div className="text-xs font-semibold text-cosmos-400 uppercase tracking-wider px-1">
        {label}
      </div>
      <div className="rounded-xl border border-cosmos-700/50 overflow-hidden bg-cosmos-900/60 backdrop-blur-sm">
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          height="300px"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
          }}
        />
      </div>
      {children}
    </div>
  );
}
