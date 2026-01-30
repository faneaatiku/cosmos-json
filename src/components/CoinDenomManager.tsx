import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function CoinDenomManager() {
  const { settings, updateSettings } = useSettings();
  const [denom, setDenom] = useState("");
  const [decimals, setDecimals] = useState("6");
  const [displayDenom, setDisplayDenom] = useState("");

  const addDenom = () => {
    const trimmedDenom = denom.trim().toLowerCase();
    const trimmedDisplay = displayDenom.trim();
    const parsedDecimals = parseInt(decimals, 10);
    if (!trimmedDenom || !trimmedDisplay) return;
    if (isNaN(parsedDecimals) || parsedDecimals < 0) return;
    if (settings.coinDenoms.some((c) => c.denom === trimmedDenom)) return;

    updateSettings({
      coinDenoms: [
        ...settings.coinDenoms,
        {
          denom: trimmedDenom,
          decimals: parsedDecimals,
          displayDenom: trimmedDisplay,
        },
      ],
    });
    setDenom("");
    setDecimals("6");
    setDisplayDenom("");
  };

  const removeDenom = (d: string) => {
    updateSettings({
      coinDenoms: settings.coinDenoms.filter((c) => c.denom !== d),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addDenom();
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-cosmos-200">
        Coin Denoms
      </div>
      <div className="text-xs text-cosmos-500">
        Configure decimal places and display symbol per denom. Unrecognized
        denoms default to 6 decimals.
      </div>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Denom (e.g. ubze, stake)"
          value={denom}
          onChange={(e) => setDenom(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-1.5 rounded-lg bg-cosmos-800 border border-cosmos-700 text-cosmos-100 text-sm placeholder:text-cosmos-600 focus:outline-none focus:border-nebula-500/50"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Symbol"
            value={displayDenom}
            onChange={(e) => setDisplayDenom(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-20 px-3 py-1.5 rounded-lg bg-cosmos-800 border border-cosmos-700 text-cosmos-100 text-sm placeholder:text-cosmos-600 focus:outline-none focus:border-nebula-500/50"
          />
          <input
            type="number"
            placeholder="Dec"
            min={0}
            max={20}
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-14 px-2 py-1.5 rounded-lg bg-cosmos-800 border border-cosmos-700 text-cosmos-100 text-sm placeholder:text-cosmos-600 focus:outline-none focus:border-nebula-500/50 text-center"
          />
          <button
            onClick={addDenom}
            className="flex-1 py-1.5 rounded-lg bg-nebula-500/20 text-nebula-400 hover:bg-nebula-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Add</span>
          </button>
        </div>
      </div>

      {settings.coinDenoms.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-auto">
          {settings.coinDenoms.map((item) => (
            <div
              key={item.denom}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-cosmos-800/60 border border-cosmos-700/50 group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-cosmos-400 truncate">
                  {item.denom}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-star-500/15 text-star-400 text-xs font-medium flex-shrink-0">
                {item.displayDenom}
              </span>
              <span className="text-xs text-cosmos-500 flex-shrink-0">
                {item.decimals}d
              </span>
              <button
                onClick={() => removeDenom(item.denom)}
                className="p-1 rounded text-cosmos-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex-shrink-0"
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
