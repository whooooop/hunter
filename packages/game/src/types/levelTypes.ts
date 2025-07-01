import { I18nReturnType } from "../utils/i18n";
import { WeaponType } from "../weapons/WeaponTypes";
import { Location } from "./Location";
import { Quest } from "./QuestsTypes";
import { Wave } from "./WaveTypes";

export namespace Level {
  export enum ControllerType {
    TUTORIAL = 'tutorial',
    DEFAULT = 'default',
  }

  export interface Config {
    location: Location.Id;
    multiplayer: boolean;
    controller: ControllerType;
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
    defaultWeapon: WeaponType | null;
  }

  export interface Weapon {
    type: WeaponType;
    price: number;
  }
}
