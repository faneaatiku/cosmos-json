import { useCallback, useRef, useEffect, useMemo } from "react";
import {
  Link2,
  Link2Off,
  ChevronsUpDown,
  ChevronsDownUp,
  Filter,
} from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { useSettings } from "../context/SettingsContext";
import { TreeViewProvider, useTreeView } from "../context/TreeViewContext";
import { useSyncScroll } from "../hooks/useSyncScroll";
import { analyzeJson } from "../lib/jsonAnalyzer";
import { sortKeys } from "../lib/jsonTransform";
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
    leftPercent,
    setLeftPercent,
    editorHeight,
    setEditorHeight,
    parsedHeight,
    setParsedHeight,
  } = useEditorStore();
  const { settings } = useSettings();

  // Refs for scroll sync
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const leftParsedRef = useRef<HTMLDivElement>(null);
  const rightParsedRef = useRef<HTMLDivElement>(null);

  // Editor scroll sync
  useSyncScroll(
    () => leftPanelRef.current?.querySelector(".cm-scroller") as HTMLElement | null,
    () => rightPanelRef.current?.querySelector(".cm-scroller") as HTMLElement | null,
    syncEditors && settings.dualPanel,
    [settings.dualPanel],
  );

  // Parsed view scroll sync
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
        <JsonPanel
          label="JSON"
          value={leftJson}
          onChange={setLeftJson}
          editorHeight={editorHeight}
          onEditorHeightChange={setEditorHeight}
        >
          <ParsedSection
            json={leftJson}
            height={parsedHeight}
            onHeightChange={setParsedHeight}
          />
        </JsonPanel>
      </div>
    );
  }

  // Dual panel — compare mode
  if (settings.compareMode) {
    return (
      <div className="flex flex-col gap-4 flex-1 p-4">
        <div className="flex flex-1 min-h-0 items-start">
          <div ref={leftPanelRef} style={{ width: `${leftPercent}%` }} className="min-w-0">
            <JsonPanel
              label="Left"
              value={leftJson}
              onChange={setLeftJson}
              editorHeight={editorHeight}
            />
          </div>
          <PanelDivider
            onResize={setLeftPercent}
            editorHeight={editorHeight}
            showEditorSync
            syncEditors={syncEditors}
            onToggleSyncEditors={toggleSyncEditors}
            showParsedSync={false}
            syncParsed={false}
            onToggleSyncParsed={toggleSyncParsed}
          />
          <div ref={rightPanelRef} style={{ width: `${100 - leftPercent}%` }} className="min-w-0">
            <JsonPanel
              label="Right"
              value={rightJson}
              onChange={setRightJson}
              editorHeight={editorHeight}
            />
          </div>
        </div>
        <DiffView leftJson={leftJson} rightJson={rightJson} />
      </div>
    );
  }

  // Dual panel — normal mode
  return (
    <div className="flex flex-1 p-4 min-h-0 items-start">
      <div ref={leftPanelRef} style={{ width: `${leftPercent}%` }} className="min-w-0">
        <JsonPanel
          label="Left"
          value={leftJson}
          onChange={setLeftJson}
          editorHeight={editorHeight}
          onEditorHeightChange={setEditorHeight}
        >
          <ParsedSection
            json={leftJson}
            scrollRef={leftParsedRef}
            height={parsedHeight}
            onHeightChange={setParsedHeight}
          />
        </JsonPanel>
      </div>
      <PanelDivider
        onResize={setLeftPercent}
        editorHeight={editorHeight}
        parsedHeight={parsedHeight}
        showEditorSync
        syncEditors={syncEditors}
        onToggleSyncEditors={toggleSyncEditors}
        showParsedSync
        syncParsed={syncParsed}
        onToggleSyncParsed={toggleSyncParsed}
      />
      <div ref={rightPanelRef} style={{ width: `${100 - leftPercent}%` }} className="min-w-0">
        <JsonPanel
          label="Right"
          value={rightJson}
          onChange={setRightJson}
          editorHeight={editorHeight}
          onEditorHeightChange={setEditorHeight}
        >
          <ParsedSection
            json={rightJson}
            scrollRef={rightParsedRef}
            height={parsedHeight}
            onHeightChange={setParsedHeight}
          />
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
  editorHeight,
  parsedHeight,
  showEditorSync,
  syncEditors,
  onToggleSyncEditors,
  showParsedSync,
  syncParsed,
  onToggleSyncParsed,
}: {
  onResize: (percent: number) => void;
  editorHeight: number;
  parsedHeight?: number;
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
      className="flex flex-col items-center w-12 flex-shrink-0 cursor-col-resize select-none group/divider"
    >
      {/* Spacer matching the label row */}
      <div className="h-6 flex-shrink-0 flex justify-center">
        <DividerLine />
      </div>

      {/* Editor zone — line segments around the sync button */}
      <div
        style={{ height: `${editorHeight}px` }}
        className="flex-shrink-0 flex flex-col items-center"
      >
        <DividerLine className="flex-1" />
        {showEditorSync && (
          <SyncToggle active={syncEditors} onClick={onToggleSyncEditors} label="sync" />
        )}
        <DividerLine className="flex-1" />
      </div>

      {showParsedSync && (
        <>
          {/* Spacer matching the horizontal drag handle */}
          <div className="h-3 flex-shrink-0 flex justify-center">
            <DividerLine />
          </div>

          {/* Parsed zone — line segments around the sync button */}
          <div
            style={{ height: `${parsedHeight}px` }}
            className="flex-shrink-0 flex flex-col items-center"
          >
            <DividerLine className="flex-1" />
            <SyncToggle active={syncParsed} onClick={onToggleSyncParsed} label="sync" />
            <DividerLine className="flex-1" />
          </div>
        </>
      )}
    </div>
  );
}

function DividerLine({ className = "" }: { className?: string }) {
  return (
    <div className={`w-px bg-cosmos-700/60 group-hover/divider:w-0.5 group-hover/divider:bg-nebula-500/50 transition-all ${className}`} />
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
      className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
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
  height,
  onHeightChange,
}: {
  json: string;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  height: number;
  onHeightChange: (height: number) => void;
}) {
  const { settings } = useSettings();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (scrollRef && "current" in scrollRef) {
        (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    },
    [scrollRef],
  );

  const parsed = useMemo(() => {
    if (!json.trim()) return undefined;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, [json]);

  const transformed = useMemo(() => {
    if (parsed === undefined || parsed === null) return parsed;
    return settings.sortKeys ? sortKeys(parsed) : parsed;
  }, [parsed, settings.sortKeys]);

  const analysis = useMemo(() => {
    if (!transformed)
      return {
        interestingPaths: new Set<string>(),
        ancestorPaths: new Set<string>(),
        markers: [] as Array<{ fraction: number; type: "coin" | "label" }>,
        maxDepth: 0,
      };
    return analyzeJson(transformed, {
      parseCoins: settings.parseCoins,
      labels: settings.labels,
      coinDenoms: settings.coinDenoms,
    });
  }, [transformed, settings.parseCoins, settings.labels, settings.coinDenoms]);

  if (parsed === undefined) return null;

  if (parsed === null) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-red-400 text-sm">
        Invalid JSON
      </div>
    );
  }

  return (
    <TreeViewProvider ancestorPaths={analysis.ancestorPaths} maxDepth={analysis.maxDepth}>
      <div className="flex flex-col">
        <div
          style={{ height: `${height}px` }}
          className="rounded-xl border border-cosmos-700/50 bg-cosmos-900/40 backdrop-blur-sm flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0">
            <div className="text-xs font-semibold text-cosmos-500 uppercase tracking-wider">
              Parsed View
            </div>
            <ParsedToolbar />
          </div>
          <div className="relative flex-1 min-h-0">
            <div
              ref={setRefs}
              className="h-full overflow-auto px-4 pb-4"
            >
              <JsonTreeView data={parsed} />
            </div>
            <ScrollbarMarkers markers={analysis.markers} containerRef={wrapperRef} />
          </div>
        </div>
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            document.body.style.cursor = "row-resize";
            document.body.style.userSelect = "none";
            const baseTop = wrapperRef.current?.getBoundingClientRect().top ?? 0;

            const onMove = (ev: MouseEvent) => {
              const h = ev.clientY - baseTop;
              onHeightChange(Math.min(Math.max(h, 80), window.innerHeight - 200));
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
      </div>
    </TreeViewProvider>
  );
}

// ---------------------------------------------------------------------------
// ParsedToolbar — expand/collapse all + filter buttons
// ---------------------------------------------------------------------------

function ParsedToolbar() {
  const {
    expandLevel,
    expandOneLevel,
    collapseAll,
    filterMode,
    toggleFilterMode,
    maxDepth,
  } = useTreeView();

  const allExpanded = expandLevel > maxDepth;
  const allCollapsed = expandLevel === 0;

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={allExpanded ? undefined : expandOneLevel}
        title={
          allExpanded
            ? "All levels expanded"
            : `Expand one more level (${expandLevel}/${maxDepth + 1})`
        }
        className={`p-1 rounded transition-all flex items-center gap-0.5 ${
          allExpanded
            ? "text-cosmos-700"
            : "text-cosmos-500 hover:text-cosmos-200 hover:bg-cosmos-700/60 cursor-pointer"
        }`}
      >
        <ChevronsUpDown size={13} />
        <span className="text-[10px] font-medium leading-none tabular-nums">{expandLevel}</span>
      </button>
      <button
        onClick={allCollapsed ? undefined : collapseAll}
        title={allCollapsed ? "All levels collapsed" : "Collapse all"}
        className={`p-1 rounded transition-all ${
          allCollapsed
            ? "text-cosmos-700"
            : "text-cosmos-500 hover:text-cosmos-200 hover:bg-cosmos-700/60 cursor-pointer"
        }`}
      >
        <ChevronsDownUp size={13} />
      </button>
      <button
        onClick={toggleFilterMode}
        title={filterMode ? "Show all entries" : "Show only coins & labels"}
        className={`p-1 rounded transition-all cursor-pointer ${
          filterMode
            ? "text-star-400 bg-star-500/15"
            : "text-cosmos-500 hover:text-cosmos-200 hover:bg-cosmos-700/60"
        }`}
      >
        <Filter size={13} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScrollbarMarkers — overlay showing coin/label positions on the scrollbar
// ---------------------------------------------------------------------------

function ScrollbarMarkers({
  markers,
  containerRef,
}: {
  markers: Array<{ fraction: number; type: "coin" | "label" }>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (markers.length === 0) return null;

  return (
    <div className="absolute top-0 right-0 w-2 h-full pointer-events-none">
      {markers.map((m, i) => (
        <div
          key={i}
          className={`absolute right-0 w-1.5 rounded-full pointer-events-auto cursor-pointer ${
            m.type === "coin" ? "bg-star-400/70" : "bg-nebula-400/70"
          }`}
          style={{ top: `${m.fraction * 100}%`, height: "3px" }}
          onClick={() => {
            const container = containerRef.current;
            if (!container) return;
            const visibleHeight = container.clientHeight;
            container.scrollTo({
              top: m.fraction * container.scrollHeight - visibleHeight / 2,
              behavior: "smooth",
            });
          }}
        />
      ))}
    </div>
  );
}
