/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import MerkleTree, { MerkleTree as FixedMerkleTree } from 'fixed-merkle-tree';

import { PoseidonClass } from './hash';

const getMockBranches = () => {};

export class MerkleTreeService {
  readonly name: string;

  RPC: string;

  tree: any | undefined;

  branches: any = [];

  constructor(name = 'commitments') {
    this.name = name;
    this.RPC = 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com';
  }

  async initMerkleTree(
    localItems: any[],
    baseElements: any[] = [],
    onlyLocal = false,
  ): Promise<any> {
    const { hash } = await new PoseidonClass().load();

    let branches = [];

    if (!onlyLocal) {
      try {
        branches = await this.getBranches();
      } catch (e) {
        console.warn(e)
      }
    }

    let items: any[] = [...localItems];

    if (!onlyLocal) {
      items = [...items, ...branches.map(({ value }: any) => BigInt(value))];
    }

    this.branches = branches;

    const tree = new FixedMerkleTree(32, baseElements, {
      zeroElement:
        19014214495641488759237505126948346942972912379615652741039992445865937985820n as any,
      hashFunction: hash,
    } as any);

    if (!items) {
      this.tree = tree;

      return tree;
    }

    items.forEach((value: any, i: number) => {
      const pos = baseElements.length + i;

      try {
        tree.update(pos, value);
      } catch (e) {
        console.warn(e);

        throw new Error('Error when update Merkle Tree');
      }
    });

    this.tree = tree;

    return {
      tree,
      branches,
    };
  }

  async getBranches(): Promise<any> {
    let branches: any[] = [];

    let isLastPage = false;

    while (!isLastPage) {
      const response = await fetch(`${this.RPC}/commitments`, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });

      const { data, is_last_page } = await response.json();

      branches = [...branches, ...data];

      isLastPage = is_last_page;
    }

    return branches;
  }
}
