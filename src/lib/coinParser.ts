import type { CoinDenomConfig } from "../types";

const COIN_STRING_REGEX = /^(\d+)([a-z][a-z0-9]+)$/;
const COIN_DENOM_REGEX = /^[a-z][a-z0-9]+$/;
const DEFAULT_DECIMALS = 6;

export interface ParsedCoin {
  amount: string;
  denom: string;
  displayDenom: string;
  displayAmount: string;
}

/**
 * Try to parse a string like "123231ubze" or "123231stake" into a formatted coin.
 */
export function parseCoinString(
  value: string,
  denomConfigs: CoinDenomConfig[] = [],
): ParsedCoin | null {
  const match = value.match(COIN_STRING_REGEX);
  if (!match) return null;

  const [, rawAmount, denom] = match;
  const config = denomConfigs.find((c) => c.denom === denom);
  return formatCoin(rawAmount, denom, config);
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
  const config = denomConfigs.find((c) => c.denom === obj.denom);
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
