import { Address, HeadlessClient, ODIN_NCG } from "./_remote.ts";
import { parse } from "https://deno.land/std@0.200.0/flags/mod.ts";

const options = parse<{
  address: string;
}>(Deno.args, {
  // @ts-ignore Deno std/flags module has a type bug.
  string: ["address"],
});

const address = Address.fromHex(options.address, true);
const headlessClient = new HeadlessClient(
  "https://9c-main-full-state.nine-chronicles.com/graphql",
);

const fav = await headlessClient.getBalance(address, ODIN_NCG);

console.log(fav);
