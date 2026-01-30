import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Link2, Link2Off } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { useSettings } from "../context/SettingsContext";
import { useSyncScroll } from "../hooks/useSyncScroll";
import JsonPanel from "./JsonPanel";
import JsonTreeView from "./JsonTreeView";
import DiffView from "./DiffView";

export default function JsonPanelContainer() {
  const {
    leftJson,
    rightJson,
    setLeftJson,
    setRightJson,
    syncEditors,
    syncParsed,
    toggleSyncEditors,
    toggleSyncParsed,
  } = useEditorStore();
  const { settings } = useSettings();
  const [leftPercent, setLeftPercent] = useState(50);

  const onResize = useCallback((percent: number) => {
    setLeftPercent(percent);
  }, []);

  // Refs for scroll sync
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const leftParsedRef = useRef<HTMLDivElement>(null);
  const rightParsedRef = useRef<HTMLDivElement>(null);

  // Editor scroll sync — find .cm-scroller inside each panel wrapper
  useSyncScroll(
    () => leftPanelRef.current?.querySelector(".cm-scroller") as HTMLElement | null,
    () => rightPanelRef.current?.querySelector(".cm-scroller") as HTMLElement | null,
    syncEditors && settings.dualPanel,
    [settings.dualPanel],
  );

  // Parsed view scroll sync — uses forwarded refs on ParsedSection
  useSyncScroll(
    () => leftParsedRef.current,
    () => rightParsedRef.current,
    syncParsed && settings.dualPanel && !settings.compareMode,
    [settings.dualPanel, settings.compareMode, leftJson, rightJson],
  );

  // Single panel mode
  if (!settings.dualPanel) {
    return (
      <div className="flex flex-col flex-1 p-4 min-h-0">
        <JsonPanel label="JSON" value={leftJson} onChange={setLeftJson}>
          <ParsedSection json={leftJson} />
        </JsonPanel>
      </div>
    );
  }

  // Dual panel — compare mode
  if (settings.compareMode) {
    return (
      <div className="flex flex-col gap-4 flex-1 p-4">
        <div className="flex flex-1 min-h-0">
          <div ref={leftPanelRef} style={{ width: `${leftPercent}%` }} className="min-w-0">
            <JsonPanel label="Left" value={leftJson} onChange={setLeftJson} />
          </div>
          <PanelDivider
            onResize={onResize}
            showEditorSync
            syncEditors={syncEditors}
            onToggleSyncEditors={toggleSyncEditors}
            showParsedSync={false}
            syncParsed={false}
            onToggleSyncParsed={toggleSyncParsed}
          />
          <div ref={rightPanelRef} style={{ width: `${100 - leftPercent}%` }} className="min-w-0">
            <JsonPanel label="Right" value={rightJson} onChange={setRightJson} />
          </div>
        </div>
        <DiffView leftJson={leftJson} rightJson={rightJson} />
      </div>
    );
  }

  // Dual panel — normal mode
  return (
    <div className="flex flex-1 p-4 min-h-0">
      <div ref={leftPanelRef} style={{ width: `${leftPercent}%` }} className="min-w-0">
        <JsonPanel label="Left" value={leftJson} onChange={setLeftJson}>
          <ParsedSection json={leftJson} scrollRef={leftParsedRef} />
        </JsonPanel>
      </div>
      <PanelDivider
        onResize={onResize}
        showEditorSync
        syncEditors={syncEditors}
        onToggleSyncEditors={toggleSyncEditors}
        showParsedSync
        syncParsed={syncParsed}
        onToggleSyncParsed={toggleSyncParsed}
      />
      <div ref={rightPanelRef} style={{ width: `${100 - leftPercent}%` }} className="min-w-0">
        <JsonPanel label="Right" value={rightJson} onChange={setRightJson}>
          <ParsedSection json={rightJson} scrollRef={rightParsedRef} />
        </JsonPanel>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PanelDivider — vertical resize handle with sync toggle buttons
// ---------------------------------------------------------------------------

function PanelDivider({
  onResize,
  showEditorSync,
  syncEditors,
  onToggleSyncEditors,
  showParsedSync,
  syncParsed,
  onToggleSyncParsed,
}: {
  onResize: (percent: number) => void;
  showEditorSync: boolean;
  syncEditors: boolean;
  onToggleSyncEditors: () => void;
  showParsedSync: boolean;
  syncParsed: boolean;
  onToggleSyncParsed: () => void;
}) {
  const dividerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't start drag if clicking a sync button
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      dragging.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const container = dividerRef.current?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.min(Math.max((x / rect.width) * 100, 15), 85);
      onResize(percent);
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
  }, [onResize]);

  return (
    <div
      ref={dividerRef}
      onMouseDown={onMouseDown}
      className="flex flex-col items-center w-10 flex-shrink-0 cursor-col-resize select-none py-6"
    >
      {showEditorSync && (
        <SyncToggle active={syncEditors} onClick={onToggleSyncEditors} label="sync" />
      )}

      {/* Drag line */}
      <div className="flex-1 flex items-center justify-center group">
        <div className="w-0.5 h-12 rounded-full bg-cosmos-700 group-hover:bg-nebula-500 group-hover:h-20 transition-all" />
      </div>

      {showParsedSync && (
        <SyncToggle active={syncParsed} onClick={onToggleSyncParsed} label="sync" />
      )}
    </div>
  );
}

function SyncToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={active ? `Scroll sync on (${label})` : `Scroll sync off (${label})`}
      className={`flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
        active
          ? "text-nebula-300 bg-nebula-500/25 border-nebula-500/50 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
          : "text-cosmos-500 bg-cosmos-800/50 border-cosmos-700/60 hover:text-cosmos-300 hover:border-cosmos-600 hover:bg-cosmos-800/80"
      }`}
    >
      {active ? <Link2 size={16} /> : <Link2Off size={16} />}
      <span className="text-[9px] font-semibold uppercase leading-none tracking-wide">
        {label}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// ParsedSection — renders parsed JSON tree with optional scroll ref
// ---------------------------------------------------------------------------

function ParsedSection({
  json,
  scrollRef,
}: {
  json: string;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [height, setHeight] = useState(300);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Combine the external scrollRef with the internal wrapperRef
  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (scrollRef && "current" in scrollRef) {
        (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    },
    [scrollRef],
  );

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
      const newHeight = e.clientY - rect.top;
      setHeight(Math.min(Math.max(newHeight, 80), window.innerHeight - 200));
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

  const parsed = useMemo(() => {
    if (!json.trim()) return undefined;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, [json]);

  if (parsed === undefined) return null;

  if (parsed === null) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-red-400 text-sm">
        Invalid JSON
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div
        ref={setRefs}
        style={{ height: `${height}px` }}
        className="rounded-xl border border-cosmos-700/50 bg-cosmos-900/40 backdrop-blur-sm p-4 overflow-auto"
      >
        <div className="text-xs font-semibold text-cosmos-500 uppercase tracking-wider mb-2">
          Parsed View
        </div>
        <JsonTreeView data={parsed} />
      </div>
      <div
        onMouseDown={onHandleMouseDown}
        className="h-2 flex-shrink-0 cursor-row-resize group flex items-center justify-center my-0.5"
      >
        <div className="h-0.5 w-12 rounded-full bg-cosmos-700 group-hover:bg-nebula-500 group-hover:w-20 transition-all" />
      </div>
    </div>
  );
}
