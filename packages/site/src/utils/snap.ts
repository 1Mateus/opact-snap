/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-description */
import type { MetaMaskInpageProvider } from '@metamask/providers';

import { defaultSnapOrigin } from '../config';
import type { GetSnapsResponse, Snap } from '../types';

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

/**
 * Get the installed snaps in MetaMask.
 *
 * @param provider - The MetaMask inpage provider.
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (
  provider?: MetaMaskInpageProvider,
): Promise<GetSnapsResponse> =>
  (await (provider ?? window.ethereum).request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (error) {
    console.log('Failed to obtain installed snap', error);
    return undefined;
  }
};

export async function getProver(path: string) {
  const proverText = await fetch(path);

  const parsedFile = JSON.parse(await proverText.text());

  return parsedFile;
}

export const getWallet = async () => {
  const res = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'getWallet',
      },
    },
  });

  return res;
};

export const createWallet = async () => {
  const res = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'createWallet',
      },
    },
  });

  return res;
};

export const createProof = async () => {
  const res = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'generateProof',
        params: {
          prover: await getProver('/provers/transaction.json'),
        },
      },
    },
  });

  return res;
};

export const encrypt = async (data: any) => {
  const res = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'encryptData',
        params: {
          data,
        },
      },
    },
  });

  return res;
};

export const decrypt = async (data: any) => {
  const res = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'decryptData',
        params: {
          data,
        },
      },
    },
  });

  return res;
};

export const sendHello = async () => {
  const res = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'createWallet',
      },
    },
  });

  return res;
};

export const generateDepositProof = async (params: any) => {
  const res = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        params: {
          ...params,
          prover: await getProver('/provers/transaction.json'),
        },
        method: 'generateDepositProof',
      },
    },
  });

  return res;
};
