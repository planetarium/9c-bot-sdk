import {
  Address,
  BencodexRecordView,
  encodeCurrency,
  FungibleAssetValue,
} from "./deps.ts";

export function encodeTransferAssetAction(
  recipient: Address,
  sender: Address,
  amount: FungibleAssetValue,
  memo: string | null,
) {
  return new BencodexRecordView(
    {
      type_id: "transfer_asset5",
      values: {
        // `encodeFungibleAssetValue()` wasn't exported properly.
        amount: [encodeCurrency(amount.currency), amount.rawValue],
        ...(memo === null ? {} : { memo }),
        recipient: recipient.toBytes(),
        sender: sender.toBytes(),
      },
    },
    "text",
  );
}
