const COIN_STRING_REGEX = /^(\d+)(u[a-z][a-z0-9]{2,})$/;
const DECIMALS = 6;

export interface ParsedCoin {
  amount: string;
  denom: string;
  displayDenom: string;
  displayAmount: string;
}

/**
 * Try to parse a string like "123231ubze" into a formatted coin.
 */
export function parseCoinString(value: string): ParsedCoin | null {
  const match = value.match(COIN_STRING_REGEX);
  if (!match) return null;

  const [, rawAmount, denom] = match;
  return formatCoin(rawAmount, denom);
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
    /^u[a-z][a-z0-9]{2,}$/.test(o.denom)
  );
}

/**
 * Parse a Cosmos SDK coin object into a formatted coin.
 */
export function parseCoinObject(obj: {
  amount: string;
  denom: string;
}): ParsedCoin {
  return formatCoin(obj.amount, obj.denom);
}

function formatCoin(rawAmount: string, denom: string): ParsedCoin {
  const displayDenom = denom.slice(1).toUpperCase();
  const displayAmount = formatAmount(rawAmount);

  return { amount: rawAmount, denom, displayDenom, displayAmount };
}

/**
 * String-based decimal formatting to avoid floating-point errors.
 * Inserts a decimal point 6 places from the right.
 */
function formatAmount(raw: string): string {
  // Pad with leading zeros if needed
  const padded = raw.padStart(DECIMALS + 1, "0");
  const intPart = padded.slice(0, padded.length - DECIMALS);
  const decPart = padded.slice(padded.length - DECIMALS);

  // Strip trailing zeros from decimal part
  const trimmedDec = decPart.replace(/0+$/, "");

  if (trimmedDec === "") {
    return intPart;
  }

  return `${intPart}.${trimmedDec}`;
}
