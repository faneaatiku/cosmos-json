import type { Label } from "../types";

/**
 * Looks up a string value in the label map.
 * Returns the label if found, otherwise null.
 */
export function getLabel(
  value: string,
  labels: Label[],
): string | null {
  const match = labels.find((l) => l.value === value);
  return match ? match.label : null;
}
