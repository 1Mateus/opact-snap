/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { HDKey } from 'ethereum-cryptography/hdkey';
import { toHex } from 'ethereum-cryptography/utils';
import * as nacl from 'tweetnacl';

import { deriveBabyJubKeysFromEth } from './babyjub';
import { generateMnemonic, mnemonicToSeed } from './bip39';
import { combineHex } from '../utils';

export const getWalletAddress = async (hdkey: HDKey): Promise<string> => {
  const encryptionPubkeyUint8 = nacl.box.keyPair.fromSecretKey(
    hdkey.privateKey as Uint8Array,
  ).publicKey;

  const encryptionPubkey = `0x${toHex(encryptionPubkeyUint8)}`;

  const pvtkey = `0x${toHex(hdkey.privateKey as Uint8Array)}`;

  const derivedKeys = await deriveBabyJubKeysFromEth({ pvtkey });

  return combineHex({
    derivedKeys,
    encryptionPubkey,
  });
};

export const getWalletFromSeed = async ({ seed }: { seed: Uint8Array }) => {
  const hdkey = HDKey.fromMasterSeed(seed);

  const address = await getWalletAddress(hdkey);

  const pubkey = `0x${toHex(hdkey.publicKey as Uint8Array)}`;
  const pvtkey = `0x${toHex(hdkey.privateKey as Uint8Array)}`;

  return {
    // hdkey,
    pubkey,
    pvtkey,
    address,
  };
};

export const getRandomWallet = (): any => {
  const mnemonic = generateMnemonic();

  const seed = mnemonicToSeed(mnemonic);

  return getWalletFromSeed(seed);
};

export const getWalletFromMnemonic = (mnemonic: string): any => {
  const seed = mnemonicToSeed(mnemonic);

  return getWalletFromSeed(seed);
};
