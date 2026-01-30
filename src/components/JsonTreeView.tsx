import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import {
  parseCoinString,
  isCoinObject,
  parseCoinObject,
} from "../lib/coinParser";
import { getLabel } from "../lib/labeler";
import { sortKeys } from "../lib/jsonTransform";
import CoinDisplay from "./CoinDisplay";
import type { JsonValue } from "../types";

interface JsonTreeViewProps {
  data: JsonValue;
}

export default function JsonTreeView({ data }: JsonTreeViewProps) {
  const { settings } = useSettings();
  const transformed = settings.sortKeys ? sortKeys(data) : data;

  return (
    <div className="font-mono text-sm leading-relaxed">
      <JsonNode value={transformed} depth={0} />
    </div>
  );
}

function JsonNode({
  value,
  depth,
  keyName,
}: {
  value: JsonValue;
  depth: number;
  keyName?: string;
}) {
  const { settings } = useSettings();

  if (value === null) {
    return (
      <InlineValue keyName={keyName} depth={depth}>
        <span className="text-cosmos-500">null</span>
      </InlineValue>
    );
  }

  if (typeof value === "boolean") {
    return (
      <InlineValue keyName={keyName} depth={depth}>
        <span className="text-pink-400">{value ? "true" : "false"}</span>
      </InlineValue>
    );
  }

  if (typeof value === "number") {
    return (
      <InlineValue keyName={keyName} depth={depth}>
        <span className="text-star-400">{value}</span>
      </InlineValue>
    );
  }

  if (typeof value === "string") {
    const coin =
      settings.parseCoins ? parseCoinString(value, settings.coinDenoms) : null;
    const matchedLabel = getLabel(value, settings.labels);

    return (
      <InlineValue keyName={keyName} depth={depth}>
        <span className="text-nebula-400">"{value}"</span>
        {coin && (
          <span className="ml-1.5">
            <CoinDisplay coin={coin} />
          </span>
        )}
        {matchedLabel && (
          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-nebula-500/15 text-nebula-300 text-xs font-medium">
            {matchedLabel}
          </span>
        )}
      </InlineValue>
    );
  }

  if (Array.isArray(value)) {
    return (
      <CollapsibleNode
        keyName={keyName}
        depth={depth}
        bracket={["[", "]"]}
        count={value.length}
      >
        {value.map((item, i) => (
          <JsonNode key={i} value={item} depth={depth + 1} />
        ))}
      </CollapsibleNode>
    );
  }

  // Object
  const entries = Object.entries(value);
  const coinBadge =
    settings.parseCoins && isCoinObject(value) ? (
      <CoinDisplay
        coin={parseCoinObject(
          value as { amount: string; denom: string },
          settings.coinDenoms,
        )}
      />
    ) : null;

  return (
    <CollapsibleNode
      keyName={keyName}
      depth={depth}
      bracket={["{", "}"]}
      count={entries.length}
      badge={coinBadge}
    >
      {entries.map(([k, v]) => (
        <JsonNode key={k} value={v} depth={depth + 1} keyName={k} />
      ))}
    </CollapsibleNode>
  );
}

function InlineValue({
  keyName,
  depth,
  children,
}: {
  keyName?: string;
  depth: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      {keyName !== undefined && (
        <span className="text-nebula-300">"{keyName}"</span>
      )}
      {keyName !== undefined && <span className="text-cosmos-500">: </span>}
      {children}
    </div>
  );
}

function CollapsibleNode({
  keyName,
  depth,
  bracket,
  count,
  badge,
  children,
}: {
  keyName?: string;
  depth: number;
  bracket: [string, string];
  count: number;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(depth > 3);

  return (
    <div>
      <div
        style={{ paddingLeft: depth * 16 }}
        className="cursor-pointer hover:bg-cosmos-800/40 rounded flex items-center gap-0.5"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="text-cosmos-500 w-4 flex-shrink-0">
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </span>
        {keyName !== undefined && (
          <span className="text-nebula-300">"{keyName}"</span>
        )}
        {keyName !== undefined && <span className="text-cosmos-500">: </span>}
        <span className="text-cosmos-500">
          {bracket[0]}
          {collapsed && (
            <span className="text-cosmos-600 text-xs ml-1">
              {count} {count === 1 ? "item" : "items"}
            </span>
          )}
          {collapsed && bracket[1]}
        </span>
        {badge && <span className="ml-1.5">{badge}</span>}
      </div>
      {!collapsed && (
        <>
          {children}
          <div style={{ paddingLeft: depth * 16 }}>
            <span className="text-cosmos-500 ml-4">{bracket[1]}</span>
          </div>
        </>
      )}
    </div>
  );
}
