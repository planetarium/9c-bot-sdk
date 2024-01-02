import { Address, type Currency } from "./deps.ts";

const LegacyCurrency = {
  maximumSupply: null,
  totalSupplyTrackable: false,
};

const MinterlessCurrency = {
  minters: null,
};

const MinterlessLegacyCurrency = {
  ...MinterlessCurrency,
  ...LegacyCurrency,
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

const NcgTemplate = {
  ticker: "NCG",
  decimalPlaces: 2,
  ...LegacyCurrency,
} as const;

/**
 * Create NCG currency with the given {@link minters}.
 * @param minters An array of minter {@link Address | address}es.
 * @returns The NCG currency with the given {@link minters}.
 */
export function NcgWithMinters(minters: Address[] | null): Currency {
  return {
    minters: minters === null ? null : new Set(minters.map((x) => x.toBytes())),
    ...NcgTemplate,
  };
}

export const ODIN_NCG: Currency = NcgWithMinters([
  Address.fromHex("0x47d082a115c63e7b58b1532d20e631538eafadde", true),
]);

export const HEIMDALL_NCG: Currency = NcgWithMinters(null);
