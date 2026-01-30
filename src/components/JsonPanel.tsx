import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { getCosmicExtensions } from "../lib/codemirrorSetup";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";

interface JsonPanelProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
}

export default function JsonPanel({ label, value, onChange, children }: JsonPanelProps) {
  const extensions = useMemo(() => [json(), ...getCosmicExtensions()], []);
  const [editorHeight, setEditorHeight] = useState(300);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onHandleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      setEditorHeight(Math.min(Math.max(y, 100), window.innerHeight - 200));
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="flex-1 flex flex-col min-w-0">
      <div className="text-xs font-semibold text-cosmos-400 uppercase tracking-wider px-1 mb-2">
        {label}
      </div>
      <div className="rounded-xl border border-cosmos-700/50 overflow-hidden bg-cosmos-900/60 backdrop-blur-sm">
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
      {children && (
        <>
          <div
            onMouseDown={onHandleMouseDown}
            className="h-2 flex-shrink-0 cursor-row-resize group flex items-center justify-center my-0.5"
          >
            <div className="h-0.5 w-12 rounded-full bg-cosmos-700 group-hover:bg-nebula-500 group-hover:w-20 transition-all" />
          </div>
          {children}
        </>
      )}
    </div>
  );
}
