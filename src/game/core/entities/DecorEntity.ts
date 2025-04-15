import { settings } from "../../settings";
import { DamageableEntity } from "./DamageableEntity";

interface DecorEntityOptions {
  health: number;
  permeability?: number;
}

export class DecorEntity extends DamageableEntity {
  constructor(gameObject: Phaser.Physics.Arcade.Sprite, options: DecorEntityOptions) {
    super(gameObject, { 
      health: options.health,
      permeability: typeof options.permeability === 'number' ? options.permeability : 1
    });
    this.gameObject.setDepth(
      this.gameObject.y + this.gameObject.height / 2 * this.gameObject.scale + settings.gameplay.depthOffset
    );
  }
}
