import {
  Address,
  AssetTransfer,
  HeadlessClient,
  ODIN_NCG,
  RawPrivateKey,
  Signer,
} from "./_remote.ts";
import { parse } from "https://deno.land/std@0.200.0/flags/mod.ts";
import { Decimal } from "https://esm.sh/decimal.js@10.4.3";

const options = parse<{
  privateKey: string;
}>(Deno.args);

const account = RawPrivateKey.fromHex(options.privateKey);
const headlessClient = new HeadlessClient(
  "https://9c-main-full-state.nine-chronicles.com/graphql",
);
const signer = new Signer(headlessClient, account);
const transfer = new AssetTransfer(signer);

const txid = await transfer.transfer(
  Address.fromHex("0x9093dd96c4bb6b44a9e0a522e2de49641f146223", true),
  {
    currency: ODIN_NCG,
    rawValue: BigInt(new Decimal(0.01).pow(ODIN_NCG.decimalPlaces).toFixed(0)),
  },
);

console.log(txid);
