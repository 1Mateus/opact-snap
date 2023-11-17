/* eslint-disable id-denylist */
import type { OnRpcRequestHandler } from '@metamask/snaps-types';

import { decrypt, encrypt } from './encryption';
import { getRandomWallet } from './keys';
import { generateZKProof } from './proofGenerator';
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

        // const baseUtxos = [0n, 30n, 40n, 50n, 10n, 20n, 10n, 20n, 0n];

        // const token = 832719810210204902983213847411017819246076070166n;

        // const { babyjubPubkey: pubkey } = separateHex(
        //   persistedData?.wallet.address,
        // );

        // const utxos = [
        //   ...baseUtxos.map((amount) => getUtxo({ amount, token, pubkey })),
        // ];

        // const commitments = utxos.map((utxo) => ({
        //   value: utxo.hash.toString(),
        // }));

        // const treeBalance = {
        //   token,
        //   utxos,
        //   balance: 150n,
        // };

        // const batch = await getDepositSoluctionBatch({
        //   treeBalance,
        //   totalRequired: 15n,
        //   senderWallet: wallet,
        //   selectedToken: {
        //     id: '',
        //     refName: {
        //       name: 'coin',
        //       namespace: ''
        //     },
        //     refSpec: {
        //       name: 'fungible-v2',
        //       namespace: ''
        //     }
        //   }
        // })

        const res = await generateZKProof(request.params);

        return res;
      } catch (error: any) {
        return 'Error to generate ZK Proof';
      }
    }

    default:
      throw new Error('Method not found.');
  }
};
