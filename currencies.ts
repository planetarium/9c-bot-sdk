import type { Currency } from "https://esm.sh/@planetarium/tx@3.9.2";

const MinterlessLegacyCurrency = {
  minters: null,
  maximumSupply: null,
  totalSupplyTrackable: false,
};

export const MEAD: Currency = {
  ticker: "Mead",
  decimalPlaces: 18,
  ...MinterlessLegacyCurrency,
} as const;

export const CRYSTAL: Currency = {
  ticker: "CRYSTAL",
  decimalPlaces: 18,
  ...MinterlessLegacyCurrency,
} as const;
