import { useContext, useState } from 'react';

import { MetamaskActions, MetaMaskContext } from '../hooks';
import { decrypt } from '../utils';
import { GButton } from './Buttons';
import { GCard, Title } from './Card';

export const DecryptWidget = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [value, setValue] = useState('')
  const [decrypted, setDecrypted] = useState('')

  const handle = async () => {
    try {
      const res = await decrypt(value) as any

      console.log('fuckingres', res)

      setDecrypted(res);
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  return (
    <GCard disabled={!state.installedSnap} fullWidth>
      <Title>Decrypt Data</Title>

      {state.opactWallet && (
        <div className="break-words flex flex-col space-y-4">
          <div>
            <textarea
              id="message"
              rows={4}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="block p-2.5 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-3xl"
              placeholder="Input value to Decrypt"
            ></textarea>
          </div>

          <GButton
            onClick={async () => handle()}
            disabled={!state.installedSnap}
          >
            Decrypt Value
          </GButton>

          {decrypted && (
            <div>
              {decrypted}
            </div>
          )}
        </div>
      )}
    </GCard>
  );
};
