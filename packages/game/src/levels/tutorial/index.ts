import { Level } from '../../types/levelTypes';
import { Location } from '../../types/Location';
import { I18n } from '../../utils/i18n';
import { WeaponType } from "../../weapons/WeaponTypes";
import { quests } from './quests';
import { createWavesConfig } from './waves';

import forestPreview from './assets/preview.png';

export const TutorialLevelConfig: Level.Config = {
  location: Location.Id.FOREST,
  controller: Level.ControllerType.TUTORIAL,
  multiplayer: false,
  name: I18n({
    en: 'Tutorial',
    ru: 'Обучение',
  }),
  preview: {
    key: 'tutorial_location_preview',
    url: forestPreview,
    scale: 0.5,
  },
  quests,
  wavesCount: 2,
  waves: createWavesConfig,
  weapons: [
    {
      type: WeaponType.REVOLVER,
      price: 50,
    },
    {
      type: WeaponType.M4,
      price: 100,
    },
  ],
  defaultWeapon: null,
}
