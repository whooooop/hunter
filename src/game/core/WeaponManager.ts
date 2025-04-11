import { BaseWeapon } from "../core/BaseWeapon";
import { Glock } from "../weapons/glock/Glock";
import { MP5 } from "../weapons/MP5/MP5";
import { Grenade } from "../weapons/grenade/Grenade";
import { Sawed } from "../weapons/sawed/Sawed";

export class WeaponManager {
  private scene: Phaser.Scene;
  private weapons: Map<string, BaseWeapon> = new Map();

  static WEAPONS = {
    'glock': Glock,
    'mp5': MP5,
    'grenade': Grenade,
    'sawed': Sawed,
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  static preload(scene: Phaser.Scene): void {
    Glock.preload(scene);
    MP5.preload(scene);
    Grenade.preload(scene);
    Sawed.preload(scene);
  }

  public getWeapon(id: string): BaseWeapon {
    const weapon = this.weapons.get(id);
    if (weapon) {
      return weapon;
    } else {
      const weapon = new WeaponManager.WEAPONS[id as keyof typeof WeaponManager.WEAPONS](this.scene)
      this.weapons.set(id, weapon);
      return weapon;
    }
  }
}