import { useContext } from 'react';

import { MetamaskActions, MetaMaskContext } from '../hooks';
import { createWallet, shortenAddress } from '../utils';
import { GButton } from './Buttons';
import { GCard, Title } from './Card';

export const WalletWidget = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleCreateWallet = async () => {
    try {
      const wallet = await createWallet();

      dispatch({ type: MetamaskActions.setOpactWallet, payload: wallet });
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  return (
    <GCard disabled={!state.installedSnap} fullWidth>
      <Title>Opact Wallet</Title>

      {state.opactWallet && (
        <div className="break-words flex flex-col space-y-4">
          <div className="flex items-center w-full space-x-4">
            <span className="font-[600]">Opact Address:</span>

            <span>{shortenAddress(state.opactWallet?.address, 8)}</span>
          </div>

          <div className="flex items-center w-full space-x-4">
            <span className="font-[600]">Opact Pubkey:</span>

            <span>{shortenAddress(state.opactWallet?.pubkey, 8)}</span>
          </div>
        </div>
      )}

      {!state.opactWallet && (
        <GButton
          onClick={async () => handleCreateWallet()}
          disabled={!state.installedSnap}
        >
          Create Random Wallet
        </GButton>
      )}
    </GCard>
  );
};
