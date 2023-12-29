import { Address, encodeBencodex, encodeHex, encodeSignedTx } from "./deps.ts";
import { SignedTx } from "./signer.ts";

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

  async #request(
    query: string,
    operationName: string,
    variables: Record<string, string | number>,
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
