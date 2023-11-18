/* eslint-disable jsdoc/require-jsdoc */
import { buildPoseidon } from 'circomlibjs';

function stringToBigInt(inputString: string): bigint {
  let asciiBigInt = BigInt(0);
  for (let i = 0; i < inputString.length; i++) {
    const asciiValue = BigInt(inputString.charCodeAt(i));
    asciiBigInt = asciiBigInt * BigInt(256) + asciiValue;
  }
  return asciiBigInt;
}

export const getPoseidonMessageHash = async (value: any) => {
  const poseidon = await buildPoseidon();

  return poseidon.F.toObject(poseidon([value]));
};

export const getPoseidonTokenHash = async (value: any) => {
  const poseidon = await buildPoseidon();

  return poseidon.F.toObject(poseidon([stringToBigInt(value)]));
};
