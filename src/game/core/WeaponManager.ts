import { BaseWeapon } from "../weapons/BaseWeapon";
import { Pistol } from "../weapons/pistol/Pistol";

export class WeaponManager {
  private scene: Phaser.Scene;
  private weapons: Map<string, BaseWeapon> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.weapons.set('pistol', new Pistol(this.scene));
  }

  public preload(): void {
    for (const weapon of this.weapons.values()) {
      weapon.preload();
    }
  }

  public getWeapon(id: string): BaseWeapon {
    return this.weapons.get(id) as BaseWeapon;
  }
}