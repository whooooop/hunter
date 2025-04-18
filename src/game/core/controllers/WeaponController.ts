import { WeaponEntity } from "../entities/WeaponEntity";
import { createWeapon } from "../../weapons";
import { WeaponType } from "../../weapons/WeaponTypes";
import { Player } from "../../entities/Player";
import { emitEvent } from "../Events";
import { PlayerEvents } from "../types/playerTypes";

export class WeaponController {
  private scene: Phaser.Scene;
  private players: Map<string, Player>;
  private playerWeapons: Map<string, Map<WeaponType, WeaponEntity>> = new Map();
  private currentWeapon: Map<string, WeaponEntity> = new Map();

  constructor(scene: Phaser.Scene, players: Map<string, Player>) {
    this.scene = scene;
    this.players = players;
  }

  public getWeapon(playerId: string, weaponType: WeaponType): WeaponEntity {
    if (!this.playerWeapons.has(playerId)) {
      this.playerWeapons.set(playerId, new Map());
    }

    if (!this.playerWeapons.get(playerId)!.has(weaponType)) {
      const weapon = createWeapon(weaponType, this.scene);
      this.playerWeapons.get(playerId)!.set(weaponType, weapon);
      return weapon;
    }

    return this.playerWeapons.get(playerId)!.get(weaponType)!;
  }

  private getCurrentWeapon(playerId: string): WeaponEntity {
    return this.currentWeapon.get(playerId)!;
  }

  public setWeapon(playerId: string, weaponType: WeaponType): void {
    const currentWeapon = this.getCurrentWeapon(playerId);

    if (currentWeapon) {
      currentWeapon.setPosition(-2000, - 2000, 1);
    }

    const weapon = this.getWeapon(playerId, weaponType);

    this.currentWeapon.set(playerId, weapon);
    this.players.get(playerId)!.setWeapon(weapon);
    
    emitEvent(this.scene, PlayerEvents.PlayerSetWeaponEvent, { playerId, weaponType });
  }
}