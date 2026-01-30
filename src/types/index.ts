export interface Label {
  value: string;
  label: string;
}

export interface CoinDenomConfig {
  denom: string;
  decimals: number;
  displayDenom: string;
}

export interface Settings {
  parseCoins: boolean;
  sortKeys: boolean;
  compareMode: boolean;
  dualPanel: boolean;
  labels: Label[];
  coinDenoms: CoinDenomConfig[];
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
