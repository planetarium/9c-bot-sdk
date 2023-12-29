import { MEAD } from "./currencies.ts";
import {
  Account,
  Address,
  BencodexValue as Value,
  decodeHex,
  signTx,
  UnsignedTx,
} from "./deps.ts";
import { HeadlessClient } from "./headless.ts";

export type SignedTx = Awaited<ReturnType<typeof signTx>>;

export class Signer {
  constructor(
    private readonly headlessClient: HeadlessClient,
    private readonly account: Account,
  ) {}

  async sign(
    action: Value,
    gasLimit: bigint,
    timestamp?: Date,
    updatedAddresses?: Set<Address>,
  ): Promise<SignedTx> {
    const address = await this.account.getAddress();
    const publicKey = await this.account.getPublicKey();
    const nonce = await this.headlessClient.getNextTxNonce(address);
    const genesisHash = await this.headlessClient.getGenesisHash();
    const unsignedTx: UnsignedTx = {
      nonce,
      genesisHash: decodeHex(genesisHash),
      signer: address.toBytes(),
      publicKey: publicKey.toBytes("uncompressed"),
      actions: [action],
      updatedAddresses: updatedAddresses === undefined
        ? new Set()
        : new Set(Array.from(updatedAddresses).map((x) => x.toBytes())),
      timestamp: timestamp || new Date(),
      maxGasPrice: {
        currency: MEAD,
        rawValue: 1n,
      },
      gasLimit,
    };

    console.dir(unsignedTx);

    return signTx(unsignedTx, this.account);
  }

  async signAndSend(
    action: Value,
    gasLimit: bigint,
    timestamp?: Date,
    updatedAddresses?: Set<Address>,
  ): Promise<string> {
    const signedTx = await this.sign(
      action,
      gasLimit,
      timestamp,
      updatedAddresses,
    );
    return this.headlessClient.stageTransaction(signedTx);
  }

  getAddress(): Promise<Address> {
    return this.account.getAddress();
  }
}
