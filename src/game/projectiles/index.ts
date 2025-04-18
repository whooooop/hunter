import { generateId } from "../../utils/stringGenerator"
import { ProjectileEntity } from "../core/entities/ProjectileEntity"

import { ProjectileMine } from "./Mine"
import { ProjectileGrenade } from "./Grenade"
import { ProjectileBullet } from "./Bullet"
import { ExplosionEntity } from "../core/entities/ExplosionEntity"
import { ProjectileName } from "./ProjectileName"

export const ProjectileCollection = {
  [ProjectileName.BULLET]: ProjectileBullet,
  [ProjectileName.GRENADE]: ProjectileGrenade,
  [ProjectileName.MINE]: ProjectileMine,
}

export function preloadProjectiles(scene: Phaser.Scene): void {
  ExplosionEntity.preload(scene);
  Object.values(ProjectileCollection).forEach(ProjectileClass => {
    ProjectileClass.preload(scene);
  });
}

export function createProjectile(scene: Phaser.Scene, projectileName: ProjectileName, x: number, y: number, playerId: string, weaponName: string): ProjectileEntity {
  const ProjectileClass = ProjectileCollection[projectileName];
  const id = generateId();
  const object = new ProjectileClass(scene, id, x, y);
  object.assign(playerId, weaponName);
  return object;
}
