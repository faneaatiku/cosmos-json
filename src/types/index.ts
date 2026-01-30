export interface Label {
  value: string;
  label: string;
}

export interface Settings {
  parseCoins: boolean;
  sortKeys: boolean;
  compareMode: boolean;
  dualPanel: boolean;
  labels: Label[];
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
