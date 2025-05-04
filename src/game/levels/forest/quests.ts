import { I18n } from "../../../utils/i18n";
import { Bank, Enemy, Game, Quest } from "../../core/types";
import { WeaponType } from "../../weapons/WeaponTypes";

export const quests: Quest.Config[] = [
  {
    id: 'lfq1',
    tasks: [
      {
        id: 'lfq1t1',
        reward: { currency: Bank.Currency.Star, amount: 1 },
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
        id: 'lfq1t2',
        reward: { currency: Bank.Currency.Star, amount: 1 },
        title: I18n({
          en: 'Earn 100 points',
          ru: 'Заработать 100 очков',
        }),
        event: Game.Events.Stat.EarnEvent.Event,
        valueKey: 'score',
        value: 100,
        count: -1,
        conditions: []
      },
      {
        id: 'lfq1t3',
        reward: { currency: Bank.Currency.Star, amount: 1 },
        title: I18n({
          en: 'Damage 1000 points',
          ru: 'Нанести 1000 очков урона',
        }),
        event: Game.Events.Stat.EnemyDamageEvent.Event,
        valueKey: 'damage',
        value: 500,
        count: -1,
        conditions: []
      },
     
    ]
  },
  {
    id: 'lfq2',
    tasks: [
      {
        id: 'lfq1t4',
        reward: { currency: Bank.Currency.Star, amount: 1 },
        title: I18n({
          en: 'Kill 5 rabbits',
          ru: 'Убить 5 кроликов',
        }),
        event: Game.Events.Stat.EnemyKillEvent.Event,
        count: 5,
        conditions: [
          { key: 'enemyType', value: Enemy.Type.RABBIT },
        ],
      },
      {
        id: 'lfq2t1',
        reward: { currency: Bank.Currency.Star, amount: 1 },
        title: I18n({
          en: 'Kill 15 rabbits',
          ru: 'Убить 15 кроликов',
        }),
        event: Game.Events.Stat.EnemyKillEvent.Event,
        count: 15,
        conditions: [
          { key: 'enemyType', value: Enemy.Type.RABBIT },
        ],
      },
      {
        id: 'lfq2t2',
        reward: { currency: Bank.Currency.Star, amount: 1 },
        title: I18n({
          en: '5 AWP kills',
          ru: '5 убийств из AWP',
        }),
        event: Game.Events.Stat.EnemyKillEvent.Event,
        count: 5,
        conditions: [
          { key: 'weaponName', value: WeaponType.AWP },
          { key: 'distance', operator: '>', value: 10 },
        ]
      },
      
    ]
  } 
]