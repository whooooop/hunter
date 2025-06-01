import { WeaponType } from "../weapons/WeaponTypes";

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
  background: Phaser.GameObjects.Shape;
  icon?: Phaser.GameObjects.Sprite;
  priceText?: Phaser.GameObjects.Text;
  weaponData: ShopWeapon; // Храним данные об оружии для легкого доступа
}

export namespace Shop {
  export namespace Events {
    export namespace Opened {
      export const Event = 'shopOpenedEvent';
      export interface Payload {
        playerId: string;
        opened: boolean;
      }
    }
  }
}