import { Level } from '../../types/levelTypes';
import { Location } from '../../types/Location';
import { I18n } from '../../utils/i18n';
import { quests } from './quests';
import { createWavesConfig } from './waves';
import { zombieForestWeapons } from './weapons';

import { WeaponType } from '../../weapons/WeaponTypes';
import zombieForestPreview from './assets/preview.png';

export const ZombieForestLevelConfig: Level.Config = {
  location: Location.Id.ZOMBIE_FOREST,
  multiplayer: true,
  controller: Level.ControllerType.DEFAULT,
  name: I18n({
    en: 'Zombie Forest',
    ru: 'Зомби лес',
  }),
  preview: {
    key: 'zombie_forest_location_preview',
    url: zombieForestPreview,
    scale: 0.5,
  },
  // video: {
  //   key: 'zombie_forest_location_video',
  //   url: zombieForestVideo,
  //   scale: 0.35,
  // },
  quests,
  wavesCount: 5,
  waves: createWavesConfig,
  weapons: zombieForestWeapons,
  defaultWeapon: WeaponType.GLOCK,
}
