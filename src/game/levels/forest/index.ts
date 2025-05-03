import { createWavesConfig } from './waves';
import { Location } from '../../core/types/Location';
import { I18n } from '../../../utils/i18n';
import { forestWeapons } from './weapons';
import { Level } from '../../core/types/levelTypes';
import { quests } from './quests';

import forestPreview from './assets/preview.png';

export const ForestLevelConfig: Level.Config = {
  location: Location.Id.FOREST,
  name: I18n({
    en: 'Green Forest',
    ru: 'Зеленый лес',
  }),
  preview: {
    key: 'forest_location_preview',
    url: forestPreview,
    scale: 0.5,
  },
  quests,
  waves: createWavesConfig,
  weapons: forestWeapons,
}
