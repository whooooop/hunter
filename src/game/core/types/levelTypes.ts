import { WeaponType } from "../../weapons/WeaponTypes";
import { Wave } from "../controllers/WaveController";
import { Location } from "./Location";
import { Quest } from "./QuestsTypes";

export namespace Level {
  export interface Config {
    location: Location.Id;
    name: { 
      locale(locale: string): string; 
      readonly translate: string; 
    }
    preview?: {
      key: string;
      url: string;
      scale: number;
    }
    waves: () => Wave[];
    quests: Quest.Config[];
    weapons: Weapon[];
  }

  export interface Weapon {
    type: WeaponType;
    price: number;
  }
}
