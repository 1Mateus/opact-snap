/* eslint-disable */
import * as edssa from 'circomlibjs';

function uint8ArrayToBigInt(uint8Array: any) {
  let result = BigInt(0);
  for (let i = 0; i < uint8Array.length; i++) {
    // Convert each byte to BigInt and shift it
    result = (result << BigInt(8)) + BigInt(uint8Array[i]);
  }
  return result;
}

/**
 * TODO: Refact this function
 */
export async function subgroupDecompress(x: bigint | number): Promise<[bigint, bigint]> {
  const babyjub = await edssa.buildBabyjub()

  x = BigInt(x);

  const p: bigint = babyjub.p;
  const one: bigint = BigInt(1);

  const x2: bigint = (x * x) % p;
  const A: bigint = babyjub.A;
  const D: bigint = babyjub.D;

  function modInverse(a: bigint, mod: bigint): bigint {
      const b: bigint = BigInt(mod);

      let [lastRem, rem] = [a, b];

      let [x, lastX]: [bigint, bigint] = [0n, 1n];

      while (rem) {
          let quotient: bigint = lastRem / rem;

          [lastRem, rem] = [rem, lastRem % rem];
          [x, lastX] = [lastX - quotient * x, x];
      }

      return (lastX < 0) ? lastX + mod : lastX;
  }

  const t: bigint = (A * x2 - one) * modInverse(D * x2 - one, p) % p;

  const y: bigint = BigInt(babyjub.F.sqrt(t));

  if (babyjub.inSubgroup([x, y])) {
    return [x, y]
  };

  if (babyjub.inSubgroup([x, babyjub.p - y])) {
    return [x, babyjub.p - y]
  };

  throw new Error("Not a compressed point at subgroup");
}

export const validatePubkey = async (pubkey: bigint) => {
  const babyjub = await edssa.buildBabyjub()

  const decompressed = await subgroupDecompress(pubkey)

  return babyjub.inCurve(decompressed)
}

export const deriveBabyJubKeysFromEth = async (wallet: any) => {
  const babyjub = await edssa.buildBabyjub()

  const adjustedPrivateKey = BigInt(wallet.pvtkey) % babyjub.subOrder;

  const pubkey = uint8ArrayToBigInt(babyjub.mulPointEscalar(babyjub.Base8, adjustedPrivateKey)[0])

  // if (!await validatePubkey(pubkey)) {
  //   throw new Error('Invalid public key')
  // }

  return {
    pubkey,
    pvtkey: adjustedPrivateKey,
  };
}
