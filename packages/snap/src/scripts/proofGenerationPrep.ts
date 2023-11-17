// SPDX-License-Identifier: MIT
import { readBinFile, readSection } from '@iden3/binfileutils';
import { Buffer } from 'buffer';
import * as fs from 'fs';
import path from 'path';
import { zKey } from 'snarkjs';
import { parse } from 'ts-command-line-args';

// Tell JSON how to serialize BigInts
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

/**
 * Because we can not read files inside the SES of a snap, we parse the data here
 * to have it in typescript and be able to pass it through the RPC endpoint.
 *
 * @param circuitName - Name of the circuit to find the files.
 * @param circuitDir - Directory holding the .wasm and .zkey files.
 * @returns The parameters to generate the proof with.
 */
async function createCircuitData(
  circuitName: string,
  circuitDir: string,
): Promise<any> {
  // read the wasm file asa array.
  // It becomes a Uint8Array later, but is passed as ordinary number array through the RPC
  const wasm = Uint8Array.from(
    fs.readFileSync(path.join(circuitDir, `${circuitName}.wasm`)),
  );

  const { fd: fdZKey, sections: sectionsZKey } = await readBinFile(
    path.join(circuitDir, `${circuitName}.zkey`),
    'zkey',
    2,
    1 << 25,
    1 << 23,
  );

  const zkeyHeader = await zKey.readHeader(fdZKey, sectionsZKey);

  const zkeySections: any[] = [];

  for (let i = 4; i < 10; i++) {
    zkeySections.push(await readSection(fdZKey, sectionsZKey, i));
  }

  const params: any = {
    prover: {
      wasm,
      zkeyHeader,
      zkeySections,
    },
  };
  return params;
}

/**
 * To simplify reading the data in the frontend, we write it to a json file here.
 * Then it can be imported on demand to be uploaded to the snap.
 *
 * @param filePath - Path to write to.
 * @param data - Data to write.
 */
async function writeCircuitDataToJSON(filePath: string, data: any) {
  // format data for writing to file (othewise arrays look like objects)
  // using base64 encoding for Uint8Arrays to minimize file size while still being able to send it though the RPC in JSON format
  data.prover.zkeyHeader.q = data.prover.zkeyHeader.q.toString();
  data.prover.zkeyHeader.r = data.prover.zkeyHeader.r.toString();

  for (let i = 0; i < data.prover.zkeySections.length; i++) {
    data.prover.zkeySections[i] = Buffer.from(
      data.prover.zkeySections[i],
    ).toString('base64');
  }
  data.prover.zkeyHeader.vk_alpha_1 = Buffer.from(
    data.prover.zkeyHeader.vk_alpha_1,
  ).toString('base64');
  data.prover.zkeyHeader.vk_beta_1 = Buffer.from(
    data.prover.zkeyHeader.vk_beta_1,
  ).toString('base64');
  data.prover.zkeyHeader.vk_beta_2 = Buffer.from(
    data.prover.zkeyHeader.vk_beta_2,
  ).toString('base64');
  data.prover.zkeyHeader.vk_gamma_2 = Buffer.from(
    data.prover.zkeyHeader.vk_gamma_2,
  ).toString('base64');
  data.prover.zkeyHeader.vk_delta_1 = Buffer.from(
    data.prover.zkeyHeader.vk_delta_1,
  ).toString('base64');
  data.prover.zkeyHeader.vk_delta_2 = Buffer.from(
    data.prover.zkeyHeader.vk_delta_2,
  ).toString('base64');

  console.log(
    `curve name: ${JSON.stringify(data.prover.zkeyHeader.curve.name)}`,
  );

  // removing curve data because it would increase the transmission size dramatically and it can be reconstructed from the curve name
  data.prover.zkeyHeader.curveName = data.prover.zkeyHeader.curve.name;
  delete data.prover.zkeyHeader.curve;

  const jsContent = {
    wasm: Buffer.from(data.prover.wasm).toString('base64'),
    zkeyHeader: data.prover.zkeyHeader,
    zkeySections: data.prover.zkeySections,
  };
  console.log(
    `resulting JSON has size: ${
      JSON.stringify(jsContent).length / (1024 * 1024)
    } MB`,
  );

  fs.writeFileSync(filePath, JSON.stringify(jsContent));
  console.log(`Written to ${filePath}`);
}

type IProofGenPrepArguments = {
  circuitName: string;
  circuitsDir: string;
  output?: string;
};

/**
 * Main function to run.
 */
async function main() {
  // proccess command line arguments
  const args = parse<IProofGenPrepArguments>({
    circuitName: {
      type: String,
      description: 'Name of the circuit to generate the proof for',
    },
    circuitsDir: {
      type: String,
      description: 'Path to the directory containing the wasm and zkey files',
    },
    output: {
      type: String,
      optional: true,
      description:
        '(optional) Path to the output file to write the result to. Defaults to packages/galactica-dapp/public/provers/<name>.json',
      defaultValue: undefined,
    },
  });

  if (!args.output) {
    args.output = `${__dirname}/../../../galactica-dapp/public/provers/${args.circuitName}.json`;
  }

  if (!fs.existsSync(args.circuitsDir)) {
    throw new Error(`Circuit dir ${args.circuitsDir} does not exist.`);
  }

  if (!fs.existsSync(path.dirname(args.output))) {
    throw new Error(`Target dir for ${args.output} does not exist.`);
  }

  // extract needed circuit data
  const params = await createCircuitData(args.circuitName, args.circuitsDir);

  await writeCircuitDataToJSON(args.output, params);

  // copy vkey file to make it available for off-chain verification
  const vkeyPath = path.join(args.circuitsDir, `${args.circuitName}.vkey.json`);

  if (!fs.existsSync(vkeyPath)) {
    throw new Error(`Verification key ${vkeyPath} does not exist.`);
  }

  fs.copyFileSync(
    vkeyPath,
    path.join(path.dirname(args.output), `${args.circuitName}.vkey.json`),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
