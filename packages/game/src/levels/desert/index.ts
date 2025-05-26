import { Location } from '../../types/Location';
import { I18n } from '../../utils/i18n';
import { Level } from '../../types/levelTypes';

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
  quests: [],
  weapons: [],
}
