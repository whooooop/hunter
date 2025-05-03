import { Location } from '../../core/types/Location';
import { I18n } from '../../../utils/i18n';
import { Level } from '../../core/types/levelTypes';

export const DesertLevelConfig: Level.Config = {
  location: Location.Id.DESERT,
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
