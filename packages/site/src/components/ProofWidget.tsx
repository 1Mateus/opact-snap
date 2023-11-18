import { useContext, useState } from 'react';

import { MetamaskActions, MetaMaskContext } from '../hooks';
import { createProof, generateDepositProof } from '../utils';
import { GButton } from './Buttons';
import { GCard, Title } from './Card';

export const ProofWidget = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    setValue('');

    try {
      const res = (await createProof()) as any;

      setValue(res);

      // const res = await generateDepositProof({ amount: 10 });

      console.log('fuckingres', res);

      // dispatch({
      //   type: MetamaskActions.SetInfo,
      //   payload: `Proof generation successful.`,
      // });
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GCard disabled={!state.installedSnap} fullWidth>
      <Title>Create Generic Proof</Title>

      {state.opactWallet && (
        <div className="break-words flex flex-col space-y-4">
          <GButton
            onClick={async () => handle()}
            disabled={!state.installedSnap}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-blue"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Generate ZK Proof'
            )}
          </GButton>

          {value && <div>{JSON.stringify(value)}</div>}
        </div>
      )}
    </GCard>
  );
};
