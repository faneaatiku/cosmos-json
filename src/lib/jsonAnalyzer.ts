import { parseCoinString, isCoinObject, parseStringifiedCoins } from "./coinParser";
import { getLabel } from "./labeler";
import type { JsonValue, Label, CoinDenomConfig } from "../types";

export interface AnalysisResult {
  interestingPaths: Set<string>;
  ancestorPaths: Set<string>;
  markers: Array<{ fraction: number; type: "coin" | "label" }>;
  maxDepth: number;
}

export function analyzeJson(
  data: JsonValue,
  options: {
    parseCoins: boolean;
    labels: Label[];
    coinDenoms: CoinDenomConfig[];
  },
): AnalysisResult {
  const interestingPaths = new Set<string>();
  const ancestorPaths = new Set<string>();
  const markers: Array<{ fraction: number; type: "coin" | "label" }> = [];
  let maxDepth = 0;

  // Count total lines as if fully expanded
  function countLines(value: JsonValue): number {
    if (
      value === null ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      return 1;
    }
    if (Array.isArray(value)) {
      return (
        1 + value.reduce<number>((sum, item) => sum + countLines(item), 0) + 1
      );
    }
    const obj = value as { [key: string]: JsonValue };
    return (
      1 +
      Object.values(obj).reduce<number>((sum, v) => sum + countLines(v), 0) +
      1
    );
  }

  const totalLines = countLines(data);
  let currentLine = 0;

  function walk(value: JsonValue, path: string, depth: number) {
    if (
      value === null ||
      typeof value === "boolean" ||
      typeof value === "number"
    ) {
      currentLine++;
      return;
    }

    if (typeof value === "string") {
      currentLine++;
      const hasCoin =
        options.parseCoins &&
        parseCoinString(value, options.coinDenoms) !== null;
      const hasLabel = getLabel(value, options.labels) !== null;
      const hasStringifiedCoin =
        options.parseCoins &&
        parseStringifiedCoins(value, options.coinDenoms).length > 0;

      if (hasCoin || hasStringifiedCoin) {
        interestingPaths.add(path);
        addAncestors(path, ancestorPaths);
        markers.push({ fraction: currentLine / totalLines, type: "coin" });
      } else if (hasLabel) {
        interestingPaths.add(path);
        addAncestors(path, ancestorPaths);
        markers.push({ fraction: currentLine / totalLines, type: "label" });
      }
      return;
    }

    if (Array.isArray(value)) {
      if (depth > maxDepth) maxDepth = depth;
      currentLine++; // header
      value.forEach((item, i) => walk(item, `${path}.${i}`, depth + 1));
      currentLine++; // closing bracket
      return;
    }

    // Object
    if (depth > maxDepth) maxDepth = depth;
    currentLine++; // header
    if (options.parseCoins && isCoinObject(value)) {
      interestingPaths.add(path);
      addAncestors(path, ancestorPaths);
      markers.push({ fraction: currentLine / totalLines, type: "coin" });
    }

    for (const [k, v] of Object.entries(value)) {
      walk(v, `${path}.${k}`, depth + 1);
    }
    currentLine++; // closing bracket
  }

  walk(data, "$", 0);
  return { interestingPaths, ancestorPaths, markers, maxDepth };
}

function addAncestors(path: string, set: Set<string>) {
  const parts = path.split(".");
  for (let i = 1; i < parts.length; i++) {
    set.add(parts.slice(0, i).join("."));
  }
}
