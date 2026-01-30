import {
  GitCompareArrows,
  SortAsc,
  Settings,
  Coins,
  Columns2,
  Square,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

interface HeaderProps {
  onOpenSettings: () => void;
}

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        active
          ? "bg-nebula-500/30 text-nebula-300 border border-nebula-500/50 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
          : "bg-cosmos-800/60 text-cosmos-400 border border-cosmos-700/50 hover:bg-cosmos-700/60 hover:text-cosmos-200"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

export default function Header({ onOpenSettings }: HeaderProps) {
  const { settings, updateSettings } = useSettings();

  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-cosmos-700/50 bg-cosmos-900/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold bg-gradient-to-r from-nebula-400 to-nebula-300 bg-clip-text text-transparent">
          Cosmos JSON
        </div>
        <span className="text-xs text-cosmos-500 hidden sm:inline">
          viewer & comparator
        </span>
      </div>

      <div className="flex items-center gap-2">
        <ToggleButton
          active={settings.sortKeys}
          onClick={() => updateSettings({ sortKeys: !settings.sortKeys })}
          icon={SortAsc}
          label="Sort Keys"
        />
        <ToggleButton
          active={settings.parseCoins}
          onClick={() => updateSettings({ parseCoins: !settings.parseCoins })}
          icon={Coins}
          label="Parse Coins"
        />
        <ToggleButton
          active={settings.dualPanel}
          onClick={() =>
            updateSettings({ dualPanel: !settings.dualPanel })
          }
          icon={settings.dualPanel ? Columns2 : Square}
          label={settings.dualPanel ? "Dual" : "Single"}
        />
        <ToggleButton
          active={settings.compareMode}
          onClick={() =>
            updateSettings({ compareMode: !settings.compareMode })
          }
          icon={GitCompareArrows}
          label="Compare"
        />

        <div className="w-px h-6 bg-cosmos-700/50 mx-1" />

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-cosmos-400 hover:text-cosmos-200 hover:bg-cosmos-700/60 transition-all cursor-pointer"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
