import { Level } from '../../types/levelTypes';
import { Location } from '../../types/Location';
import { I18n } from '../../utils/i18n';
import { quests } from './quests';
import { createWavesConfig } from './waves';
import { forestWeapons } from './weapons';

import forestPreview from './assets/preview.png';

export const ForestLevelConfig: Level.Config = {
  location: Location.Id.FOREST,
  name: I18n({
    en: 'Spring Forest',
    ru: 'Весенний лес',
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
