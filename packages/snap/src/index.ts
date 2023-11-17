import type { OnRpcRequestHandler } from '@metamask/snaps-types';

import { generateZKProof } from './proofGenerator';

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
      return '';
    }

    case 'generateProof': {
      try {
        const res = await generateZKProof(request.params);

        return res;
      } catch (error: any) {
        return 'deu ruim campeao';
      }
    }

    default:
      throw new Error('Method not found.');
  }
};
