import { useMemo } from "react";
import { computeDiff, formatDiffHtml } from "../lib/jsonDiff";
import { useSettings } from "../context/SettingsContext";
import { sortKeys } from "../lib/jsonTransform";
import type { JsonValue } from "../types";

interface DiffViewProps {
  leftJson: string;
  rightJson: string;
}

export default function DiffView({ leftJson, rightJson }: DiffViewProps) {
  const { settings } = useSettings();

  const result = useMemo(() => {
    try {
      let left = JSON.parse(leftJson) as JsonValue;
      let right = JSON.parse(rightJson) as JsonValue;

      if (settings.sortKeys) {
        left = sortKeys(left);
        right = sortKeys(right);
      }

      const delta = computeDiff(left, right);
      if (!delta) {
        return { type: "identical" as const };
      }

      const html = formatDiffHtml(left, delta);
      return { type: "diff" as const, html };
    } catch {
      return { type: "error" as const };
    }
  }, [leftJson, rightJson, settings.sortKeys]);

  if (result.type === "error") {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-red-400 text-sm">
        Both panels must contain valid JSON to compare.
      </div>
    );
  }

  if (result.type === "identical") {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-950/20 p-4 text-green-400 text-sm">
        The two JSON documents are identical.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cosmos-700/50 bg-cosmos-900/40 backdrop-blur-sm overflow-auto max-h-[500px]">
      <div className="text-xs font-semibold text-cosmos-500 uppercase tracking-wider p-4 pb-2">
        Diff View
      </div>
      <div
        className="p-4 pt-0 text-sm font-mono"
        dangerouslySetInnerHTML={{ __html: result.html }}
      />
    </div>
  );
}
