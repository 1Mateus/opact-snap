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
      id: 0,
      amount: 0n,
      pubkey: derivedKeys.pubkey,
      address: selectedToken.refName,
    }),
    await getUtxo({
      token,
      id: 0,
      amount: 0n,
      pubkey: derivedKeys.pubkey,
      address: selectedToken.refName,
    }),
    await getUtxo({
      token,
      id: 0,
      amount: 0n,
      pubkey: derivedKeys.pubkey,
      address: selectedToken.refName,
    }),
  ];

  const utxosOut = await getSolutionOuts({
    utxosIn,
    treeBalance: {
      token,
    },
    totalRequired,
    selectedToken,
    senderPubkey: senderWallet.pubkey,
    isDeposit: true,
  });

  const delta = await getDelta({ utxosOut, utxosIn });

  const { roots, newIns } = await computeTreeValues(utxosIn, false);

  return {
    delta,
    roots,
    token,
    utxosOut,
    utxosIn: newIns,
  };
};
