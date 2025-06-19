import { I18nReturnType } from "../utils/i18n";
import { WeaponType } from "../weapons/WeaponTypes";
import { Location } from "./Location";
import { Quest } from "./QuestsTypes";
import { Wave } from "./WaveTypes";

export namespace Level {
  export interface Config {
    location: Location.Id;
    disabled?: boolean;
    name: I18nReturnType<string>;
    preview?: {
      key: string;
      url: string;
      scale: number;
    }
    video?: {
      key: string;
      url: string;
      scale: number;
    }
    wavesCount: number;
    waves: () => Wave.Config[];
    quests: Quest.Config[];
    weapons: Weapon[];
  }

  export interface Weapon {
    type: WeaponType;
    price: number;
  }
}
