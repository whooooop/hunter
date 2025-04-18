export type Damage = {
  value: number;
  forceVector: number[][];
  hitPoint: number[];
  simulate: boolean;
  playerId: string;
  weaponName: string;
}