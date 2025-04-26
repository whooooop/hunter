import { ImageTexture } from "./texture";

export namespace Projectile {

  export enum Type {
    BULLET = 'bullet',
    GRENADE = 'grenade',
    MINE = 'mine',
  }

  export interface Config {
    type: Projectile.Type;

    texture: ImageTexture;

    count?: number;
    spreadAngle?: number;
  
    radius?: number;
    useRadiusDamage?: boolean;
    activateDelay?: number;
    activateRadius?: number;
  
    force?: number;
    bounce?: number;
    drag?: number;
    gravity?: number;
  }
}
