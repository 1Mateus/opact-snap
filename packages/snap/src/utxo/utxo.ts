/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-extraneous-dependencies */
import { buildPoseidon } from 'circomlibjs';
import { getRandomBytesSync } from 'ethereum-cryptography/random';
import { toHex } from 'ethereum-cryptography/utils';

import { TXO } from './types/utxo.type';

export const ownerCommit = async ({ pubkey, blinding }: any) => {
  const poseidon = await buildPoseidon();

  return poseidon.F.toObject(poseidon([pubkey, blinding]));
};

// TODO: FIX IT
export const outUtxoInputs = async ({
  token,
  amount,
  pubkey,
  blinding,
}: any) => {
  const poseidon = await buildPoseidon();

  return poseidon.F.toObject(
    poseidon([token, amount, await ownerCommit({ pubkey, blinding })]),
  );
};

export const utxoHash = async ({ token, amount, pubkey, blinding }: TXO) =>
  await outUtxoInputs({ token, amount, pubkey, blinding });

export const inUtxoInputs = ({ token, amount, blinding }: any) => [
  token,
  amount,
  blinding,
];

export const getNullifier = async ({ utxo, secret }: any) => {
  const poseidon = await buildPoseidon();

  return poseidon.F.toObject(poseidon([secret, await utxoHash(utxo)]));
};

export const objUtxoInputs = async ({
  token,
  amount,
  pubkey,
  blinding,
}: any) => {
  return {
    token,
    amount,
    owner_commit: await ownerCommit({ pubkey, blinding }),
  };
};

export const outUtxoInputsNoHashed = async ({
  blinding,
  token,
  amount,
  pubkey,
}: any) => {
  const owner = await ownerCommit({
    blinding,
    pubkey,
  });

  return [BigInt(token), BigInt(amount), BigInt(owner)];
};

export const getUtxo = async ({
  token,
  pubkey,
  id = '0',
  amount = 0n,
  address = 'coin',
}: any): Promise<any> => {
  const blinding = BigInt(`0x${toHex(getRandomBytesSync(32))}`);

  const core = {
    token,
    amount,
    blinding,
    pubkey: BigInt(pubkey),
  };

  const hash = await utxoHash(core as any);

  return {
    id,
    hash,
    address: address.name || address,
    ...core,
  };
};
