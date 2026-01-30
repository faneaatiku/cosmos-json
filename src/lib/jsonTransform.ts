import type { JsonValue } from "../types";

/**
 * Recursively sort all object keys alphabetically.
 */
export function sortKeys(value: JsonValue): JsonValue {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

  const sorted: Record<string, JsonValue> = {};
  const keys = Object.keys(value).sort();
  for (const key of keys) {
    sorted[key] = sortKeys(value[key]);
  }
  return sorted;
}
