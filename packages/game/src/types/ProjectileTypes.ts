import { Audio } from "./audioTypes";
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
    rotation?: number;
    useRadiusDamage?: boolean;
    activateDelay?: number;
    activateRadius?: number;

    activateAudio?: Audio.Asset;

    force?: number;
    bounce?: number;
    drag?: number;
    gravity?: number;
  }
}
