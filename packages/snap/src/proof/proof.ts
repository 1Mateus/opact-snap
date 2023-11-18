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
import { getNullifier, inUtxoInputs, outUtxoInputsNoHashed } from '../utxo';
// import { getPublicArgs } from './public-values'
// import { artifactStore } from '../util/artifact-store'
// import { MerkleTree, MerkleTreeService } from '../merkletree'

// const PROOF_LENGTH = 32

// const EXPECTED_VALUE = 11954255677048767585730959529592939615262310191150853775895456173962480955685n
export const computeInputs = async ({ batch, wallet, message }: any) => {
  const poseidon = await buildPoseidon()

  const { token, roots, delta, utxosIn, utxosOut } = batch;

  const { pvtkey: secret } = await deriveBabyJubKeysFromEth(wallet);

  const root = roots.tree;

  const secret_token = token;

  const subtree_root = roots.subtree;

  const mp_path = utxosIn.map((u: any) => u.mp_path);

  const nullifier = utxosIn.map(async (u: any) => {
    return getNullifier({
      utxo: u,
      secret,
    });
  });

  const mp_sibling = utxosIn.map((u: any) => u.mp_sibling);

  const utxo_out_hash = utxosOut.map(({ hash }: any) => BigInt(hash));

  const subtree_mp_sibling = utxosIn.map((u: any) => u.smp_path);

  const utxo_in_data = utxosIn.map((utxo: any) => inUtxoInputs(utxo).slice(1));

  const utxo_out_data = Promise.all(
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
      message_hash: message || poseidon([BigInt(1)]),
    },
  };
};

// export const computeProof = async ({
//   batch,
//   wallet,
//   message,
// }: any) => {

//   const { inputs } = await computeInputs({
//     batch,
//     wallet,
//     message,
//   })

//   console.log('fucking inputs', inputs)

//   const {
//     proof,
//     publicSignals
//   } = await groth16.fullProve(
//     inputs,
//     './src/utxo/tests/transaction.wasm',
//     './src/utxo/tests/transaction_0001.zkey',
//   )

//   return getPublicArgs(proof, publicSignals)
// }
