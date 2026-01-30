import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { getCosmicExtensions } from "../lib/codemirrorSetup";
import { useMemo, useRef, useState, useCallback } from "react";
import { WrapText, Minus, Copy, Check } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  const handleFormat = useCallback(() => {
    try {
      onChange(JSON.stringify(JSON.parse(value), null, 2));
    } catch { /* ignore invalid JSON */ }
  }, [value, onChange]);

  const handleMinify = useCallback(() => {
    try {
      onChange(JSON.stringify(JSON.parse(value)));
    } catch { /* ignore invalid JSON */ }
  }, [value, onChange]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="text-xs font-semibold text-cosmos-400 uppercase tracking-wider">
          {label}
        </div>
        <div className="flex items-center gap-1">
          <ToolbarButton title="Pretty format" onClick={handleFormat}>
            <WrapText size={13} />
          </ToolbarButton>
          <ToolbarButton title="Minify" onClick={handleMinify}>
            <Minus size={13} />
          </ToolbarButton>
          <ToolbarButton title="Copy" onClick={handleCopy}>
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </ToolbarButton>
        </div>
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

function ToolbarButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-1 rounded text-cosmos-500 hover:text-cosmos-200 hover:bg-cosmos-700/60 transition-all cursor-pointer"
    >
      {children}
    </button>
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
