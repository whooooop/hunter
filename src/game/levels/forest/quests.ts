import { Enemy } from "../../core/types/enemyTypes";
import { Game } from "../../core/types/gameTypes";
import { Quest } from "../../core/types/QuestsTypes";
import { WeaponType } from "../../weapons/WeaponTypes";

export const QuestsConfig: Quest.Config[] = [
  {
    id: 'quest_1',
    tasks: [
      {
        id: 'task_1',
        reward: { type: Quest.RewardType.Star, amount: 1 },
        title: 'Kill 5 rabbits',
        event: 'kill',
        count: 5,
        conditions: [
          { key: 'enemyType', value: Enemy.Type.RABBIT },
        ],
      },
      {
        id: 'task_2',
        reward: { type: Quest.RewardType.Star, amount: 1 },
        title: 'Kill 5 rabbits headshot',
        event: 'kill',
        count: 5,
        conditions: [
          { key: 'weaponName', value: WeaponType.AWP },
          { key: 'distance', operator: '>', value: 10 },
        ]
      }
    ]
  }
]