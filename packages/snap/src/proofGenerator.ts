/* eslint-disable import/no-nodejs-modules */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable jsdoc/require-description */

// SPDX-License-Identifier: BUSL-1.1
import { text, heading, divider } from '@metamask/snaps-ui';
import { Buffer } from 'buffer';
import { buildBn128, buildBls12381 } from 'ffjavascript';
import { groth16 } from 'snarkjs';

// import { proofInputMock } from './utils';

export const generateZKProof = async (
  params: any,
  inputs: any,
): Promise<any> => {

  const processedParams = await preprocessInput(params);

  try {
    const { proof, publicSignals } = await groth16.fullProveMemory(
      inputs,
      processedParams.prover.wasm,
      processedParams.prover.zkeyHeader,
      processedParams.prover.zkeySections,
    );

    console.log('proof, publicSignals', { proof, publicSignals });

    return { proof, publicSignals };
  } catch (error) {
    console.log('proof generation failed');
    console.log(error.stack);
    throw error;
  }
};

export function createProofConfirmationPrompt(
  params: any,
  proof: any,
  origin: string,
): any {
  const proofConfirmDialog = [
    heading('Disclosing zkCertificate Proof'),
    text(
      `With this action you will create a ${params.requirements.zkCertStandard.toUpperCase()} proof for ${origin}.
       This action tests whether your personal data fulfills the requirements of the proof.`,
    ),
    divider(),
  ];

  // Description of disclosures made by the proof have to be provided by the front-end because the snap can not analyze what the prover will do.
  if (params.description) {
    proofConfirmDialog.push(
      text(`Description of the proof (provided by ${origin}):`),
      text(params.description),
    );
  } else {
    throw new Error('Description of ZKP is missing');
  }

  // Generalize disclosure of inputs to any kind of inputs
  proofConfirmDialog.push(
    divider(),
    text(`The following proof parameters will be publicly visible:`),
  );

  if (params.publicInputDescriptions.length !== proof.publicSignals.length) {
    throw new Error(
      `Number of public input descriptions (${params.publicInputDescriptions.length}) does not match number of public inputs (${proof.publicSignals.length})`,
    );
  }
  proof.publicSignals.forEach((signal: any, index: number) => {
    proofConfirmDialog.push(
      text(
        `${params.publicInputDescriptions[index]}: ${JSON.stringify(signal)}`,
      ),
    );
  });
  return proofConfirmDialog;
}

async function preprocessInput(params: any): Promise<any> {
  params.prover.wasm = Uint8Array.from(
    Buffer.from(params.prover.wasm, 'base64'),
  );

  params.prover.zkeyHeader.q = BigInt(params.prover.zkeyHeader.q);
  params.prover.zkeyHeader.r = BigInt(params.prover.zkeyHeader.r);

  for (let i = 0; i < params.prover.zkeySections.length; i++) {
    params.prover.zkeySections[i] = Uint8Array.from(
      Buffer.from(params.prover.zkeySections[i], 'base64'),
    );
  }
  params.prover.zkeyHeader.vk_alpha_1 = Uint8Array.from(
    Buffer.from(params.prover.zkeyHeader.vk_alpha_1, 'base64'),
  );
  params.prover.zkeyHeader.vk_beta_1 = Uint8Array.from(
    Buffer.from(params.prover.zkeyHeader.vk_beta_1, 'base64'),
  );
  params.prover.zkeyHeader.vk_beta_2 = Uint8Array.from(
    Buffer.from(params.prover.zkeyHeader.vk_beta_2, 'base64'),
  );
  params.prover.zkeyHeader.vk_gamma_2 = Uint8Array.from(
    Buffer.from(params.prover.zkeyHeader.vk_gamma_2, 'base64'),
  );
  params.prover.zkeyHeader.vk_delta_1 = Uint8Array.from(
    Buffer.from(params.prover.zkeyHeader.vk_delta_1, 'base64'),
  );
  params.prover.zkeyHeader.vk_delta_2 = Uint8Array.from(
    Buffer.from(params.prover.zkeyHeader.vk_delta_2, 'base64'),
  );

  /* eslint-disable-next-line require-atomic-updates */
  params.prover.zkeyHeader.curve = await getCurveForSnarkJS(
    params.prover.zkeyHeader.curveName,
  );

  return params;
}

async function getCurveForSnarkJS(name: string): Promise<any> {
  let curve;
  // normalize name
  const validChars = name.toUpperCase().match(/[A-Za-z0-9]+/gu);
  if (!validChars) {
    throw new Error(`Invalid curve name '${name}'`);
  }
  const normalizedName = validChars.join('');
  if (['BN128', 'BN254', 'ALTBN128'].includes(normalizedName)) {
    curve = await buildBn128(true);
  } else if (['BLS12381'].includes(normalizedName)) {
    curve = await buildBls12381(true);
  } else {
    throw new Error(`Curve not supported: ${name}`);
  }
  return curve;
}
