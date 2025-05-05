import { WeaponType } from "../../weapons/WeaponTypes";
import { Wave } from "./WaveTypes";
import { Location } from "./Location";
import { Quest } from "./QuestsTypes";
import { I18nReturnType } from "../../../utils/i18n";

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
    waves: () => Wave.Config[];
    quests: Quest.Config[];
    weapons: Weapon[];
  }

  export interface Weapon {
    type: WeaponType;
    price: number;
  }
}
