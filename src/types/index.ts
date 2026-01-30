export interface AddressLabel {
  address: string;
  label: string;
}

export interface Settings {
  parseCoins: boolean;
  sortKeys: boolean;
  compareMode: boolean;
  addressLabels: AddressLabel[];
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
