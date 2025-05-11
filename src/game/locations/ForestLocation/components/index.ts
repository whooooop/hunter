import { BaseTree } from "./BaseTree";
import { BirchTree } from "./BirchTree";
import { SpruceTree } from "./SpruceTree";

export enum TREE_TYPES {
  SPRUCE = 'spruce',
  BIRCH = 'birch',
}

export type TreeType = typeof TREE_TYPES[keyof typeof TREE_TYPES];

export const TREE_COLLECTIONS: Record<TreeType, new (scene: Phaser.Scene, id: string, x: number, y: number, options: any) => BaseTree> = {
  [TREE_TYPES.SPRUCE]: SpruceTree,
  [TREE_TYPES.BIRCH]: BirchTree,
} as const;
