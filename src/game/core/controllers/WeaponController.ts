import { WeaponEntity } from "../entities/WeaponEntity";
import { createWeapon } from "../../weapons";
import { WeaponType } from "../../weapons/WeaponTypes";

export class WeaponController {
  private scene: Phaser.Scene;
  private weapons: Map<WeaponType, WeaponEntity> = new Map();
  private currentWeapon: WeaponType | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public setCurrentWeapon(name: WeaponType): void {
    if (this.currentWeapon === name) {
      return;
    }

    if (this.currentWeapon) {
      const currentWeapon = this.weapons.get(this.currentWeapon);
      if (currentWeapon) {
        currentWeapon.activate(false);
      }
    }

    if (!this.weapons.has(name)) {
      const weapon = createWeapon(name, this.scene);
      this.weapons.set(name, weapon);
    }

    const setWeapon = this.weapons.get(name);
    if (setWeapon) {
      setWeapon.activate(true);
      this.currentWeapon = name;
    }
  }

  public getCurrentWeapon(): WeaponEntity | null {
    if (!this.currentWeapon) {
      return null;
    }
    return this.weapons.get(this.currentWeapon) || null;
  }
}