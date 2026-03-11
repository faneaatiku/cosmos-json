import type { CoinDenomConfig } from "../types";

const COIN_STRING_REGEX = /^(\d+)([a-zA-Z][a-zA-Z0-9/:._-]{2,})$/;
const COIN_DENOM_REGEX = /^[a-zA-Z][a-zA-Z0-9/:._-]{2,}$/;
const DEFAULT_DECIMALS = 6;

export interface ParsedCoin {
  amount: string;
  denom: string;
  displayDenom: string;
  displayAmount: string;
}

/**
 * Try to parse a coin string. Handles both single coins ("123231ubze")
 * and comma-separated multi-coin strings ("269409uatone,474uphoton").
 * Returns an array of parsed coins, or empty array if parsing fails.
 */
export function parseCoinString(
  value: string,
  denomConfigs: CoinDenomConfig[] = [],
): ParsedCoin[] {
  // Try single coin first
  const match = value.match(COIN_STRING_REGEX);
  if (match) {
    const [, rawAmount, denom] = match;
    const config = denomConfigs.find((c) => c.denom.toLowerCase() === denom.toLowerCase());
    return [formatCoin(rawAmount, denom, config)];
  }

  // Fallback: try comma-separated coins
  if (!value.includes(",")) return [];

  const parts = value.split(",");
  const coins: ParsedCoin[] = [];

  for (const part of parts) {
    const partMatch = part.trim().match(COIN_STRING_REGEX);
    if (!partMatch) return []; // all parts must be valid coins
    const [, rawAmount, denom] = partMatch;
    const config = denomConfigs.find((c) => c.denom.toLowerCase() === denom.toLowerCase());
    coins.push(formatCoin(rawAmount, denom, config));
  }

  return coins;
}

/**
 * Check if an object matches the Cosmos SDK coin shape { amount: string, denom: string }.
 */
export function isCoinObject(
  obj: unknown,
): obj is { amount: string; denom: string } {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return false;
  }
  const o = obj as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length !== 2) return false;
  return (
    typeof o.amount === "string" &&
    typeof o.denom === "string" &&
    /^\d+$/.test(o.amount) &&
    COIN_DENOM_REGEX.test(o.denom)
  );
}

/**
 * Parse a Cosmos SDK coin object into a formatted coin.
 */
export function parseCoinObject(
  obj: { amount: string; denom: string },
  denomConfigs: CoinDenomConfig[] = [],
): ParsedCoin {
  const config = denomConfigs.find((c) => c.denom.toLowerCase() === obj.denom.toLowerCase());
  return formatCoin(obj.amount, obj.denom, config);
}

function formatCoin(
  rawAmount: string,
  denom: string,
  config?: CoinDenomConfig,
): ParsedCoin {
  const decimals = config?.decimals ?? DEFAULT_DECIMALS;
  const displayDenom =
    config?.displayDenom ??
    (denom.startsWith("u") ? denom.slice(1).toUpperCase() : denom.toUpperCase());
  const displayAmount = formatAmount(rawAmount, decimals);

  return { amount: rawAmount, denom, displayDenom, displayAmount };
}

/**
 * String-based decimal formatting to avoid floating-point errors.
 * Inserts a decimal point at the given number of places from the right.
 */
/**
 * Try to parse a stringified JSON value and find coin objects within it.
 * Only attempts parsing for strings starting with '{' or '['.
 */
export function parseStringifiedCoins(
  value: string,
  denomConfigs: CoinDenomConfig[] = [],
): ParsedCoin[] {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return [];
  }

  return collectCoins(parsed, denomConfigs, 0);
}

function collectCoins(
  value: unknown,
  denomConfigs: CoinDenomConfig[],
  depth: number,
): ParsedCoin[] {
  if (depth > 10 || typeof value !== "object" || value === null) return [];

  if (isCoinObject(value)) {
    return [
      parseCoinObject(
        value as { amount: string; denom: string },
        denomConfigs,
      ),
    ];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectCoins(item, denomConfigs, depth + 1));
  }

  return Object.values(value).flatMap((v) =>
    collectCoins(v, denomConfigs, depth + 1),
  );
}

function formatAmount(raw: string, decimals: number): string {
  if (decimals === 0) return raw || "0";

  // Pad with leading zeros if needed
  const padded = raw.padStart(decimals + 1, "0");
  const intPart = padded.slice(0, padded.length - decimals);
  const decPart = padded.slice(padded.length - decimals);

  // Strip trailing zeros from decimal part
  const trimmedDec = decPart.replace(/0+$/, "");

  if (trimmedDec === "") {
    return intPart;
  }

  return `${intPart}.${trimmedDec}`;
}
