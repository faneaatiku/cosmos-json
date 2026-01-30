import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function AddressLabelManager() {
  const { settings, updateSettings } = useSettings();
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");

  const addLabel = () => {
    const trimmedAddr = address.trim();
    const trimmedLabel = label.trim();
    if (!trimmedAddr || !trimmedLabel) return;
    if (settings.addressLabels.some((l) => l.address === trimmedAddr)) return;

    updateSettings({
      addressLabels: [
        ...settings.addressLabels,
        { address: trimmedAddr, label: trimmedLabel },
      ],
    });
    setAddress("");
    setLabel("");
  };

  const removeLabel = (addr: string) => {
    updateSettings({
      addressLabels: settings.addressLabels.filter((l) => l.address !== addr),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addLabel();
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-cosmos-200">
        Address Labels
      </div>
      <div className="text-xs text-cosmos-500">
        Map blockchain addresses to readable labels
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Address (e.g., cosmos1...)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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

      {settings.addressLabels.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-auto">
          {settings.addressLabels.map((item) => (
            <div
              key={item.address}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmos-800/60 border border-cosmos-700/50 group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-nebula-300 font-medium">
                  {item.label}
                </div>
                <div className="text-xs text-cosmos-500 truncate">
                  {item.address}
                </div>
              </div>
              <button
                onClick={() => removeLabel(item.address)}
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
