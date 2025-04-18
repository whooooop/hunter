import { RabbitEnemy } from "./rabbit/RabbitEntity";
import { EnemyEntity } from "../core/entities/EnemyEntity";
import { EnemyEntityOptions } from "../core/types/enemyTypes";
import { SquirrelEnemy } from "./squireel/SquirrelEnemy";
import { generateId } from "../../utils/stringGenerator";

export enum EnemyType {
  RABBIT = 'rabbit',
  SQUIRREL = 'squirrel',
}

export const EnemyCollection = {
  [EnemyType.RABBIT]: RabbitEnemy,
  [EnemyType.SQUIRREL]: SquirrelEnemy,
}

export function preloadEnemies(scene: Phaser.Scene, enemies: EnemyType[]): void {
  enemies.forEach(enemy => {
    const EnemyClass = EnemyCollection[enemy];
    EnemyClass.preload(scene);
  });
}

export function createEnemy(enemyType: EnemyType, scene: Phaser.Scene, x: number, y: number, options?: any | EnemyEntityOptions): EnemyEntity {
  const EnemyClass = EnemyCollection[enemyType];
  const id = generateId();
  return new EnemyClass(scene, id, x, y, options);
}