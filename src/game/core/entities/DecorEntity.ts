import { settings } from "../../settings";
import { DamageableEntity } from "./DamageableEntity";

interface DecorEntityOptions {
  health: number;
}

export class DecorEntity extends DamageableEntity {
  constructor(gameObject: Phaser.Physics.Arcade.Sprite, options: DecorEntityOptions) {
    super(gameObject, { health: options.health });
    this.gameObject.setDepth(
      this.gameObject.y + this.gameObject.height / 2 * this.gameObject.scale + settings.gameplay.depthOffset
    );
  }
}
