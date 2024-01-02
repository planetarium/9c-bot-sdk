import {
  Address,
  Currency,
  Decimal,
  encodeBencodex,
  encodeHex,
  encodeSignedTx,
  FungibleAssetValue,
} from "./deps.ts";
import { SignedTx } from "./signer.ts";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export class HeadlessClient {
  constructor(private readonly endpoint: string) {}

  stageTransaction(tx: SignedTx): Promise<string> {
    const bencoded = encodeSignedTx(tx);
    const encoded = encodeBencodex(bencoded);
    return this.#stageTransaction(encodeHex(encoded));
  }

  async #stageTransaction(payload: string): Promise<string> {
    const resp = await this.#request(
      `
          mutation StageTransaction($payload: String!) {
            stageTransaction(payload: $payload)
          }`,
      "StageTransaction",
      {
        payload,
      },
    );
    return resp.stageTransaction;
  }

  async getNextTxNonce(address: Address): Promise<bigint> {
    console.log(address.toHex());
    const resp = await this.#request(
      `
          query GetNextTxNonce($address: Address!) {
            transaction {
              nextTxNonce(address: $address)
            }
          }`,
      "GetNextTxNonce",
      {
        address: address.toHex(),
      },
    );
    return BigInt(resp.transaction.nextTxNonce);
  }

  async getGenesisHash(): Promise<string> {
    const resp = await this.#request(
      `
          query GetGenesisHash {
            nodeStatus {
              genesis {
                hash
              }
            }
          }`,
      "GetGenesisHash",
      {},
    );
    return resp.nodeStatus.genesis.hash;
  }

  async getBalance(
    address: Address,
    currency: Currency,
  ): Promise<FungibleAssetValue> {
    const resp = await this.#request(
      `
        query GetBalance($address: Address!, $currency: CurrencyInput!) {
          stateQuery {
            balance(address: $address, currency: $currency) {
              quantity
            }
          }
      }`,
      "GetBalance",
      {
        address: address.toHex(),
        currency: {
          ticker: currency.ticker,
          decimalPlaces: currency.decimalPlaces,
          minters: currency.minters === null
            ? null
            : Array.from(currency.minters).map((x) => encodeHex(x)),
          totalSupplyTrackable: currency.totalSupplyTrackable,
          ...(currency.maximumSupply === null
            ? {
              maximumSupplyMajorUnit: null,
              maximumSupplyMinorUnit: null,
            }
            : {
              maximumSupplyMajorUnit: Number(currency.maximumSupply.major),
              maximumSupplyMinorUnit: Number(currency.maximumSupply.minor),
            }),
        },
      },
    );

    return {
      currency,
      rawValue: BigInt(
        new Decimal(resp.stateQuery.balance.quantity).mul(
          Decimal.pow(10, currency.decimalPlaces),
        ).toFixed(0),
      ),
    };
  }

  async #request(
    query: string,
    operationName: string,
    variables: Json,
  ): Promise<any> {
    const resp = await fetch(this.endpoint, {
      method: "POST",
      body: JSON.stringify({
        query,
        operationName,
        variables,
      }),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });

    const json = (await resp.json()) as object;
    if (isErrorResponse(json)) {
      throw new GraphQLError(json.errors);
    }

    if (isSuccessResponse(json)) {
      return json.data;
    }

    throw new TypeError("Unexpected response.");
  }
}

interface GraphQLSuccessResponse {
  data: unknown;
}

function isSuccessResponse(json: object): json is GraphQLSuccessResponse {
  if ("data" in json) {
    return true;
  }

  return false;
}

interface GraphQLErrorResponse {
  errors: unknown[];
}

function isErrorResponse(json: object): json is GraphQLErrorResponse {
  if ("errors" in json) {
    return true;
  }

  return false;
}

class GraphQLError {
  constructor(public readonly errors: unknown[]) {}
}
