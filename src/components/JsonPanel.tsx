import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { getCosmicExtensions } from "../lib/codemirrorSetup";
import { useMemo, useRef } from "react";

interface JsonPanelProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  editorHeight: number;
  onEditorHeightChange?: (height: number) => void;
  children?: React.ReactNode;
}

export default function JsonPanel({
  label,
  value,
  onChange,
  editorHeight,
  onEditorHeightChange,
  children,
}: JsonPanelProps) {
  const extensions = useMemo(() => [json(), ...getCosmicExtensions()], []);
  const editorBoxRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="text-xs font-semibold text-cosmos-400 uppercase tracking-wider px-1 mb-2">
        {label}
      </div>
      <div
        ref={editorBoxRef}
        className="rounded-xl border border-cosmos-700/50 overflow-hidden bg-cosmos-900/60 backdrop-blur-sm"
      >
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          height={`${editorHeight}px`}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
          }}
        />
      </div>
      {children && onEditorHeightChange && (
        <DragHandle
          getBaseTop={() => editorBoxRef.current?.getBoundingClientRect().top ?? 0}
          onHeight={onEditorHeightChange}
        />
      )}
      {children}
    </div>
  );
}

function DragHandle({
  getBaseTop,
  onHeight,
}: {
  getBaseTop: () => number;
  onHeight: (h: number) => void;
}) {
  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        document.body.style.cursor = "row-resize";
        document.body.style.userSelect = "none";
        const baseTop = getBaseTop();

        const onMove = (ev: MouseEvent) => {
          const h = ev.clientY - baseTop;
          onHeight(Math.min(Math.max(h, 100), window.innerHeight - 200));
        };

        const onUp = () => {
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      }}
      className="h-2 flex-shrink-0 cursor-row-resize group flex items-center justify-center my-0.5"
    >
      <div className="h-0.5 w-12 rounded-full bg-cosmos-700 group-hover:bg-nebula-500 group-hover:w-20 transition-all" />
    </div>
  );
}
