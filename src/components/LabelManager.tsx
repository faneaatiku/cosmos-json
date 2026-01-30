import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function LabelManager() {
  const { settings, updateSettings } = useSettings();
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");

  const addLabel = () => {
    const trimmedValue = value.trim();
    const trimmedLabel = label.trim();
    if (!trimmedValue || !trimmedLabel) return;
    if (settings.labels.some((l) => l.value === trimmedValue)) return;

    updateSettings({
      labels: [
        ...settings.labels,
        { value: trimmedValue, label: trimmedLabel },
      ],
    });
    setValue("");
    setLabel("");
  };

  const removeLabel = (val: string) => {
    updateSettings({
      labels: settings.labels.filter((l) => l.value !== val),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addLabel();
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-cosmos-200">
        Labels
      </div>
      <div className="text-xs text-cosmos-500">
        Tag any JSON value with a readable label
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Value to match"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-1.5 rounded-lg bg-cosmos-800 border border-cosmos-700 text-cosmos-100 text-sm placeholder:text-cosmos-600 focus:outline-none focus:border-nebula-500/50"
        />
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-32 px-3 py-1.5 rounded-lg bg-cosmos-800 border border-cosmos-700 text-cosmos-100 text-sm placeholder:text-cosmos-600 focus:outline-none focus:border-nebula-500/50"
        />
        <button
          onClick={addLabel}
          className="p-1.5 rounded-lg bg-nebula-500/20 text-nebula-400 hover:bg-nebula-500/30 transition-colors cursor-pointer"
        >
          <Plus size={18} />
        </button>
      </div>

      {settings.labels.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-auto">
          {settings.labels.map((item) => (
            <div
              key={item.value}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmos-800/60 border border-cosmos-700/50 group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-nebula-300 font-medium">
                  {item.label}
                </div>
                <div className="text-xs text-cosmos-500 truncate">
                  {item.value}
                </div>
              </div>
              <button
                onClick={() => removeLabel(item.value)}
                className="p-1 rounded text-cosmos-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
