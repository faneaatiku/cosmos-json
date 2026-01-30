import { useEditorStore } from "../store/editorStore";
import { useSettings } from "../context/SettingsContext";
import JsonPanel from "./JsonPanel";
import JsonTreeView from "./JsonTreeView";
import DiffView from "./DiffView";

export default function JsonPanelContainer() {
  const { leftJson, rightJson, setLeftJson, setRightJson } = useEditorStore();
  const { settings } = useSettings();

  if (settings.compareMode) {
    return (
      <div className="flex flex-col gap-4 flex-1 p-4">
        <div className="flex gap-4 flex-1 min-h-0">
          <JsonPanel label="Left" value={leftJson} onChange={setLeftJson} />
          <JsonPanel label="Right" value={rightJson} onChange={setRightJson} />
        </div>
        <DiffView leftJson={leftJson} rightJson={rightJson} />
      </div>
    );
  }

  return (
    <div className="flex gap-4 flex-1 p-4 min-h-0">
      <JsonPanel label="Left" value={leftJson} onChange={setLeftJson}>
        <ParsedSection json={leftJson} />
      </JsonPanel>
      <JsonPanel label="Right" value={rightJson} onChange={setRightJson}>
        <ParsedSection json={rightJson} />
      </JsonPanel>
    </div>
  );
}

function ParsedSection({ json }: { json: string }) {
  if (!json.trim()) return null;

  try {
    const parsed = JSON.parse(json);
    return (
      <div className="rounded-xl border border-cosmos-700/50 bg-cosmos-900/40 backdrop-blur-sm p-4 overflow-auto max-h-[400px]">
        <div className="text-xs font-semibold text-cosmos-500 uppercase tracking-wider mb-2">
          Parsed View
        </div>
        <JsonTreeView data={parsed} />
      </div>
    );
  } catch {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-red-400 text-sm">
        Invalid JSON
      </div>
    );
  }
}
