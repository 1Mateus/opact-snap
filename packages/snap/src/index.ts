/* eslint-disable id-denylist */
import type { OnRpcRequestHandler } from '@metamask/snaps-types';

import { getDepositSoluctionBatch } from './batch';
import { decrypt, encrypt } from './encryption';
import { getRandomWallet } from './keys';
import { computeInputs } from './proof';
import { generateZKProof } from './proofGenerator';
import { proofInputMock } from './utils';
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

    case 'generateProof': {
      try {
        if (!persistedData?.wallet) {
          throw new Error('You need to create a Wallet.');
        }

        const res = await generateZKProof(request.params, proofInputMock);

        return res;
      } catch (error: any) {
        return 'Error to generate ZK Proof';
      }
    }

    case 'generateDepositProof': {
      const { amount } = request.params;

      if (!persistedData?.wallet) {
        throw new Error('You need to create a Wallet.');
      }

      const wallet = persistedData?.wallet;

      const batch = await getDepositSoluctionBatch({
        senderWallet: wallet,
        totalRequired: amount,
        selectedToken: 'erc2020',
      });

      const { inputs } = await computeInputs({
        batch,
        wallet,
      });

      console.log('computedInputs', inputs);

      const res = await generateZKProof(request.params, inputs);

      return res;
    }

    case 'getWithdrawSolutionBatch': {
      const treeBalance = request.params;

      if (!persistedData?.wallet) {
        throw new Error('You need to create a Wallet.');
      }

      const wallet = persistedData?.wallet;

      const batch = await getDepositSoluctionBatch({
        treeBalance,
        totalRequired: 15n,
        senderWallet: wallet,
        selectedToken: {
          id: '',
          refName: {
            name: 'coin',
            namespace: '',
          },
          refSpec: {
            name: 'fungible-v2',
            namespace: '',
          },
        },
      });

      return batch;
    }

    case 'sendDeposit': {
      return;
    }

    case 'sendWithdraw': {
      return;
    }

    default:
      throw new Error('Method not found.');
  }
};
