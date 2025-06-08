import { ProjectileEntity } from "../entities/ProjectileEntity"
import { AudioService } from "../services/AudioService"
import { Location, Projectile } from "../types"
import { generateId } from "../utils/stringGenerator"
import { WeaponType } from "../weapons/WeaponTypes"
import { ProjectileBulletConfig } from "./Bullet"
import { ProjectileGrenadeConfig } from "./Grenade"
import { ProjectileMineConfig } from "./Mine"
import { ProjectilePelletsConfig } from "./Pellets"
import { ProjectileProjectileConfig } from "./Projectile"
import { ProjectileName } from "./ProjectileName"

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
      AudioService.preloadAsset(scene, ProjectileConfig.activateAudio);
    }
  });
}

export function createProjectile(
  scene: Phaser.Scene,
  projectileName: ProjectileName,
  originPoint: { x: number, y: number },
  targetPoint: { x: number, y: number },
  velocity: { x: number, y: number },
  playerId: string,
  weaponName: WeaponType,
  speed: number[],
  damage: number,
  bounds: Location.Bounds
): ProjectileEntity[] {
  const config = ProjectileConfigs[projectileName];
  const count = config.count || 1;
  const objects: ProjectileEntity[] = [];

  for (let i = 0; i < count; i++) {
    const id = generateId();
    const projectile = new ProjectileEntity(scene, id, originPoint.x, originPoint.y, config);
    projectile.assign(playerId, weaponName);
    projectile.setBounds(bounds);
    projectile.setForceVector(
      targetPoint,
      velocity,
      speed,
      damage
    );
    objects.push(projectile);
  }

  return objects;
}
