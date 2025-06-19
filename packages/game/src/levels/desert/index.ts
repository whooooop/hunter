import { Level } from '../../types/levelTypes';
import { Location } from '../../types/Location';
import { I18n } from '../../utils/i18n';

export const DesertLevelConfig: Level.Config = {
  location: Location.Id.DESERT,
  disabled: true,
  name: I18n({
    en: 'Soon',
    ru: 'Скоро',
  }),
  waves: () => {
    return [];
  },
  wavesCount: 1,
  quests: [],
  weapons: [],
}
