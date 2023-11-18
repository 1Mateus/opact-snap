/* eslint-disable id-denylist */
import type { OnRpcRequestHandler } from '@metamask/snaps-types';

import { getDepositSoluctionBatch } from './batch';
import { decrypt, encrypt } from './encryption';
import { getRandomWallet } from './keys';
import { computeInputs } from './proof';
import { generateZKProof } from './proofGenerator';
// import { convertBigInts, proofInputMock } from './utils';
// import { separateHex } from './utils';

export const onRpcRequest: OnRpcRequestHandler = async ({
  // origin,
  request,
}: any) => {
  const persistedData = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  switch (request.method) {
    case 'getWallet': {
      return persistedData?.wallet;
    }

    case 'createWallet': {
      const wallet = await getRandomWallet();

      await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            ...(persistedData ?? {}),
            wallet,
          },
        },
      });

      return wallet;
    }

    case 'decryptData': {
      const { data } = request.params;

      if (!persistedData?.wallet) {
        throw new Error('You need to create a Wallet.');
      }

      if (!data) {
        throw new Error('Invalid Data.');
      }

      console.log('persistedData?.wallet.pvtkey');

      try {
        const decrypted = decrypt({
          encrypted: data,
          privateKey: persistedData?.wallet.pvtkey,
        });

        return decrypted;
      } catch (err: any) {
        console.warn(err);

        return 'Error to decrypt';
      }
    }

    case 'encryptData': {
      const { data } = request.params;

      if (!persistedData?.wallet) {
        throw new Error('You need to create a Wallet.');
      }

      if (!data) {
        throw new Error('Invalid Data.');
      }

      try {
        const encrypted = encrypt({
          data,
          address: persistedData?.wallet.address,
        });

        return encrypted;
      } catch (err: any) {
        return err;
      }
    }

    case 'generateDepositProof': {
      // const { amount } = request.params;

      if (!persistedData?.wallet) {
        throw new Error('You need to create a Wallet.');
      }

      const wallet = persistedData?.wallet;

      const batch = await getDepositSoluctionBatch({
        senderWallet: wallet,
        totalRequired: 10,
        selectedToken: 'erc2020',
      });

      const { inputs } = await computeInputs({
        batch,
        wallet,
      });

      const res = await generateZKProof(request.params, inputs);

      return res;
    }

    default:
      throw new Error('Method not found.');
  }
};
