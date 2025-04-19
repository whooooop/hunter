import { WeaponType } from "../../weapons/WeaponTypes";

export enum ShopEvents {
  WeaponPurchasedEvent = 'weaponPurchasedEvent',
}

export interface WeaponPurchasedPayload {
  playerId: string;
  weaponType: WeaponType;
  price: number;
}

export interface ShopWeapon {
    type: WeaponType;
    price: number;
}

export interface ShopSlotElement {
  background: Phaser.GameObjects.Sprite;
  icon?: Phaser.GameObjects.Sprite;
  priceText?: Phaser.GameObjects.Text;
  weaponData: ShopWeapon; // Храним данные об оружии для легкого доступа
}