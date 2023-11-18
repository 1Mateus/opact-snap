import { getDelta, getSolutionOuts } from './solutions';
import { deriveBabyJubKeysFromEth } from '../keys';
import { computeTreeValues } from '../proof/tree-values';
import { getPoseidonTokenHash } from '../util';
import { getUtxo } from '../utxo';

export const getDepositSoluctionBatch = async ({
  senderWallet,
  totalRequired,
  selectedToken,
}: any) => {
  const derivedKeys = await deriveBabyJubKeysFromEth(senderWallet);

  const token = await getPoseidonTokenHash(selectedToken);

  const utxosIn = [
    await getUtxo({
      token,
      amount: 0n,
      pubkey: derivedKeys.pubkey,
    }),
    await getUtxo({
      token,
      amount: 0n,
      pubkey: derivedKeys.pubkey,
    }),
    await getUtxo({
      token,
      amount: 0n,
      pubkey: derivedKeys.pubkey,
    }),
  ];

  const utxosOut = await getSolutionOuts({
    utxosIn,
    treeBalance: {
      token,
    },
    totalRequired,
    selectedToken,
    senderPubkey: derivedKeys.pubkey,
    isDeposit: true,
  });

  const delta = await getDelta({ utxosOut, utxosIn });

  const { roots, newIns } = await computeTreeValues(utxosIn, true);

  return {
    delta,
    roots,
    token,
    utxosOut,
    utxosIn: newIns,
  };
};
