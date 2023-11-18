/* eslint-disable id-length */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
// TODO: fix eslint
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// import { groth16 } from 'snarkjs'
import { buildPoseidon } from 'circomlibjs';

import { deriveBabyJubKeysFromEth } from '../keys';
import { inUtxoInputs, outUtxoInputsNoHashed } from '../utxo';

export const computeInputs = async ({ batch, wallet }: any) => {
  const poseidon = await buildPoseidon();

  const { token, roots, delta, utxosIn, utxosOut } = batch;

  const { pvtkey: secret } = await deriveBabyJubKeysFromEth(wallet);

  const root = roots.tree;

  const secret_token = token;

  const subtree_root = roots.subtree;

  const mp_path = utxosIn.map((u: any) => u.mp_path);

  const nullifier = utxosIn.map((u: any) => {
    return poseidon.F.toObject(poseidon([secret, u.hash]));
  });

  const mp_sibling = utxosIn.map((u: any) => u.mp_sibling);

  const utxo_out_hash = utxosOut.map(({ hash }: any) => BigInt(hash));

  const subtree_mp_sibling = utxosIn.map((u: any) => u.smp_path);

  const utxo_in_data = utxosIn.map((utxo: any) => inUtxoInputs(utxo).slice(1));

  const utxo_out_data = await Promise.all(
    batch.utxosOut.map(async (txo: any) =>
      (await outUtxoInputsNoHashed(txo)).slice(1),
    ),
  );

  return {
    inputs: {
      root,
      token,
      delta,
      secret,
      mp_path,
      nullifier,
      mp_sibling,
      secret_token,
      subtree_root,
      utxo_in_data,
      utxo_out_hash,
      utxo_out_data,
      subtree_mp_sibling,
      message_hash: poseidon.F.toObject(poseidon([BigInt(1)])),
    },
  };
};
