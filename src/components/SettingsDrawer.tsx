import { X } from "lucide-react";
import LabelManager from "./LabelManager";
import { useSettings } from "../context/SettingsContext";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { settings, updateSettings } = useSettings();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-cosmos-900 border-l border-cosmos-700/50 z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-cosmos-700/50">
          <h2 className="text-lg font-bold text-cosmos-100">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cosmos-400 hover:text-cosmos-200 hover:bg-cosmos-700/60 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-auto h-[calc(100%-57px)]">
          {/* Toggles section */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-cosmos-200">Display</div>

            <SettingToggle
              label="Parse Coins"
              description="Format Cosmos coin strings (e.g., 123231ubze → 0.123231 BZE)"
              checked={settings.parseCoins}
              onChange={(v) => updateSettings({ parseCoins: v })}
            />

            <SettingToggle
              label="Sort Keys"
              description="Sort JSON object keys alphabetically"
              checked={settings.sortKeys}
              onChange={(v) => updateSettings({ sortKeys: v })}
            />

            <SettingToggle
              label="Dual Panel"
              description="Show two side-by-side JSON panels"
              checked={settings.dualPanel}
              onChange={(v) => updateSettings({ dualPanel: v })}
            />

            <SettingToggle
              label="Compare Mode"
              description="Show diff between left and right JSON panels"
              checked={settings.compareMode}
              onChange={(v) => updateSettings({ compareMode: v })}
            />
          </div>

          <div className="border-t border-cosmos-700/50" />

          {/* Labels */}
          <LabelManager />
        </div>
      </div>
    </>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="pt-0.5">
        <div
          className={`w-9 h-5 rounded-full transition-colors relative ${
            checked ? "bg-nebula-500" : "bg-cosmos-700"
          }`}
          onClick={() => onChange(!checked)}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              checked ? "translate-x-4.5" : "translate-x-0.5"
            }`}
          />
        </div>
      </div>
      <div className="flex-1" onClick={() => onChange(!checked)}>
        <div className="text-sm text-cosmos-200 font-medium">{label}</div>
        <div className="text-xs text-cosmos-500">{description}</div>
      </div>
    </label>
  );
}
