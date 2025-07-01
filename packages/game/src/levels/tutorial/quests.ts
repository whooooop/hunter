import { Bank, Enemy, Game, Quest } from "../../types";
import { I18n } from "../../utils/i18n";
import { WeaponType } from "../../weapons/WeaponTypes";

const locationId = 'lt';

const group1: Quest.Config = {
  id: locationId + 'q1',
  tasks: [
    {
      id: locationId + 'q1' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 1 hare',
        ru: 'Убить 1 зайца',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 1,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.HARE },
      ],
    },
    {
      id: locationId + 'q1' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Purchase revolver',
        ru: 'Купить револьвер',
      }),
      event: Game.Events.Stat.PurchaseWeaponEvent.Event,
      count: 1,
      conditions: [
        { key: 'weaponName', value: WeaponType.REVOLVER },
      ]
    },
    {
      id: locationId + 'q1' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Kill 3 squirrels in head with one shot',
        ru: 'Убить 3 белки, одним выстрелом в голову',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 3,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.SQUIREEL },
        { key: 'body', value: 'head' },
        { key: 'oneShotKill', value: true },
      ],
    },
  ]
}

export const quests: Quest.Config[] = [
  group1,
]
