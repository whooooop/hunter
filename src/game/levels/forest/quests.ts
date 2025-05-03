import { Enemy } from "../../core/types/enemyTypes";
import { Game } from "../../core/types/gameTypes";
import { Quest } from "../../core/types/QuestsTypes";
import { WeaponType } from "../../weapons/WeaponTypes";

export const quests: Quest.Config[] = [
  {
    id: 'quest_1',
    tasks: [
      {
        id: 'task_3',
        reward: { type: Quest.RewardType.Star, amount: 1 },
        title: 'Purchase weapon',
        event: Game.Events.Stat.PurchaseWeaponEvent.Event,
        count: 1,
        conditions: [
          { key: 'weaponName', value: WeaponType.REVOLVER },
        ]
      },
      {
        id: 'task_4',
        reward: { type: Quest.RewardType.Star, amount: 1 },
        title: 'Earn 100 points',
        event: Game.Events.Stat.EarnEvent.Event,
        valueKey: 'score',
        value: 100,
        count: -1,
        conditions: []
      },
      {
        id: 'task_5',
        reward: { type: Quest.RewardType.Star, amount: 1 },
        title: 'Damage 1000 points',
        event: Game.Events.Stat.EnemyDamageEvent.Event,
        valueKey: 'damage',
        value: 500,
        count: -1,
        conditions: []
      },
      {
        id: 'task_1',
        reward: { type: Quest.RewardType.Star, amount: 1 },
        title: 'Kill 5 rabbits',
        event: Game.Events.Stat.EnemyKillEvent.Event,
        count: 5,
        conditions: [
          { key: 'enemyType', value: Enemy.Type.RABBIT },
        ],
      },
    ]
  },
  {
    id: 'quest_2',
    tasks: [
      {
        id: 'task_1',
        reward: { type: Quest.RewardType.Star, amount: 1 },
        title: 'Kill 5 rabbits',
        event: Game.Events.Stat.EnemyKillEvent.Event,
        count: 5,
        conditions: [
          { key: 'enemyType', value: Enemy.Type.RABBIT },
        ],
      },
      {
        id: 'task_2',
        reward: { type: Quest.RewardType.Star, amount: 1 },
        title: 'Kill 5 rabbits headshot',
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