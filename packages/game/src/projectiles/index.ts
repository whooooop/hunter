import { generateId } from "../utils/stringGenerator"
import { ProjectileEntity } from "../entities/ProjectileEntity"
import { Projectile } from "../types/ProjectileTypes"
import { ProjectileMineConfig } from "./Mine"
import { ProjectileGrenadeConfig } from "./Grenade"
import { ProjectileBulletConfig } from "./Bullet"
import { ProjectileName } from "./ProjectileName"
import { ProjectilePelletsConfig } from "./Pellets"
import { ProjectileProjectileConfig } from "./Projectile"
import { WeaponType } from "../weapons/WeaponTypes"

export const ProjectileConfigs: Record<ProjectileName, Projectile.Config> = {
  [ProjectileName.BULLET]: ProjectileBulletConfig,
  [ProjectileName.GRENADE]: ProjectileGrenadeConfig,
  [ProjectileName.MINE]: ProjectileMineConfig,
  [ProjectileName.PELLETS]: ProjectilePelletsConfig,
  [ProjectileName.PROJECTILE]: ProjectileProjectileConfig,
}

export function preloadProjectiles(scene: Phaser.Scene): void {
  Object.values(ProjectileConfigs).forEach(ProjectileConfig => {
    if (ProjectileConfig.texture.generate) {
      ProjectileConfig.texture.generate(scene, ProjectileConfig.texture.key);
    } else if (ProjectileConfig.texture.url) {
      scene.load.image(ProjectileConfig.texture.key, ProjectileConfig.texture.url);
    }
    if (ProjectileConfig.activateAudio) {
      scene.load.audio(ProjectileConfig.activateAudio.key, ProjectileConfig.activateAudio.url);
    }
  });
}

export function createProjectile(
  scene: Phaser.Scene, 
  projectileName: ProjectileName, 
  originPoint: { x: number, y: number }, 
  targetPoint: { x: number, y: number }, 
  playerId: string, 
  weaponName: WeaponType,
  speed: number[], 
  damage: number
): ProjectileEntity[] 
{
  const config = ProjectileConfigs[projectileName];
  const count = config.count || 1;
  const objects: ProjectileEntity[] = [];

  for (let i = 0; i < count; i++) {
    const id = generateId();
    const projectile = new ProjectileEntity(scene, id, originPoint.x, originPoint.y, config);
    projectile.assign(playerId, weaponName);
    const spreadAngle = config.spreadAngle || 0;
    const targetY = spreadAngle ? Phaser.Math.Between(targetPoint.y - spreadAngle, targetPoint.y + spreadAngle) : targetPoint.y;
    projectile.setForceVector(targetPoint.x, targetY, speed, damage);
    objects.push(projectile);
  }

  return objects;
}
