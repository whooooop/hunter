import { DamageableEntity } from "./DamageableEntity";

interface DecorEntityOptions {
  health: number;
}

export class DecorEntity extends DamageableEntity {
  constructor(gameObject: Phaser.Physics.Arcade.Sprite, options: DecorEntityOptions) {
    super(gameObject, { health: options.health });
  }
}
