import type { AddressLabel } from "../types";

/**
 * Looks up a string value in the address label map.
 * Returns the label if found, otherwise null.
 */
export function getAddressLabel(
  value: string,
  labels: AddressLabel[],
): string | null {
  const match = labels.find((l) => l.address === value);
  return match ? match.label : null;
}
