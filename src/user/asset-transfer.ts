import { Address, FungibleAssetValue } from "../deps.ts";
import { encodeTransferAssetAction } from "../actions.ts";
import { Signer } from "../signer.ts";

export class AssetTransfer {
  constructor(private readonly signer: Signer) {}

  async transfer(
    recipient: Address,
    amount: FungibleAssetValue,
    memo?: string | null,
  ): Promise<string> {
    const action = encodeTransferAssetAction(
      recipient,
      await this.signer.getAddress(),
      amount,
      memo === undefined ? null : memo,
    );

    return this.signer.signAndSend(action, 4n);
  }
}
