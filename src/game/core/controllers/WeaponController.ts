import { Glock } from "../../weapons/glock/Glock";
import { MP5 } from "../../weapons/MP5/MP5";
import { WeaponEntity } from "../entities/WeaponEntity";
import { Grenade } from "../../weapons/grenade/Grenade";
import { Sawed } from "../../weapons/sawed/Sawed";
import { WeaponMine } from "../../weapons/mine/WeaponMine";

export enum Weapon {
  GLOCK = 'glock',
  MP5 = 'mp5',
  GRENADE = 'grenade',
  SAWED = 'sawed',
  MINE = 'mine',
}

export class WeaponController {
  private scene: Phaser.Scene;
  private weapons: Map<Weapon, WeaponEntity> = new Map();
  private currentWeapon: Weapon | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  private createWeapon(weapon: Weapon): WeaponEntity {
    switch (weapon) {
      case Weapon.GLOCK:
          return new Glock(this.scene);
      case Weapon.MP5:
        return new MP5(this.scene); 
      case Weapon.GRENADE:
        return new Grenade(this.scene);
      case Weapon.SAWED:
        return new Sawed(this.scene);
      case Weapon.MINE:
        return new WeaponMine(this.scene);
    }
  }

  public setCurrentWeapon(name: Weapon): void {
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
      const weapon = this.createWeapon(name);
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