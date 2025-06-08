import { Bank, Enemy, Game, Quest } from "../../types";
import { I18n } from "../../utils/i18n";
import { WeaponType } from "../../weapons/WeaponTypes";

const locationId = 'lf';

const group1: Quest.Config = {
  id: locationId + 'q1',
  tasks: [
    {
      id: locationId + 'q1' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 10 hares',
        ru: 'Убить 10 зайцев',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 10,
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
        en: 'Kill 10 squirrels in head with one shot',
        ru: 'Убить 10 белок, одним выстрелом в голову',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 10,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.SQUIREEL },
        { key: 'body', value: 'head' },
        { key: 'oneShotKill', value: true },
      ],
    },
  ]
}

const group2: Quest.Config = {
  id: locationId + 'q2',
  tasks: [
    {
      id: locationId + 'q2' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 15 hares in head with one shot',
        ru: 'Убить 15 зайцев, одним выстрелом в голову',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 15,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.HARE },
        { key: 'body', value: 'head' },
        { key: 'oneShotKill', value: true },
      ],
    },
    {
      id: locationId + 'q2' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Purchase MP5',
        ru: 'Купить MP5',
      }),
      event: Game.Events.Stat.PurchaseWeaponEvent.Event,
      count: 1,
      conditions: [
        { key: 'weaponName', value: WeaponType.MP5 },
      ]
    },
    {
      id: locationId + 'q2' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Complete first wave',
        ru: 'Завершить первую волну',
      }),
      event: Game.Events.Stat.WaveCompleteEvent.Event,
      count: 1,
      conditions: [
        { key: 'waveNumber', operator: '=', value: 1 },
      ]
    },
  ]
}

const group3: Quest.Config = {
  id: locationId + 'q3',
  tasks: [
    {
      id: locationId + 'q3' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill two enemies with one shot',
        ru: 'Убить двух врагов за один выстрел',
      }),
      event: Game.Events.Stat.DubleKillEvent.Event,
      count: 1,
      conditions: []
    },
    {
      id: locationId + 'q3' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Kill 15 squirrels in head with MP5',
        ru: 'Убить 15 белок из MP5',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 15,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.SQUIREEL },
        { key: 'weaponName', value: WeaponType.MP5 },
      ],
    },
    {
      id: locationId + 'q3' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Complete second wave',
        ru: 'Завершить вторую волну',
      }),
      event: Game.Events.Stat.WaveCompleteEvent.Event,
      count: 1,
      conditions: [
        { key: 'waveNumber', operator: '=', value: 2 },
      ]
    },
  ]
}

const group4: Quest.Config = {
  id: locationId + 'q4',
  tasks: [
    {
      id: locationId + 'q4' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 20 hares with MP5',
        ru: 'Убить 20 зайцев из MP5',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 20,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.HARE },
        { key: 'weaponName', value: WeaponType.MP5 },
      ],
    },
    {
      id: locationId + 'q4' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Purchase shotgun',
        ru: 'Купить дробовик',
      }),
      event: Game.Events.Stat.PurchaseWeaponEvent.Event,
      count: 1,
      conditions: [
        { key: 'weaponName', value: WeaponType.SAWED },
      ]
    },
    {
      id: locationId + 'q4' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Complete third wave',
        ru: 'Завершить третью волну',
      }),
      event: Game.Events.Stat.WaveCompleteEvent.Event,
      count: 1,
      conditions: [
        { key: 'waveNumber', operator: '=', value: 3 },
      ]
    },
  ]
}

const group5: Quest.Config = {
  id: locationId + 'q5',
  tasks: [
    {
      id: locationId + 'q5' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 25 squirrels with shotgun',
        ru: 'Убить 25 белок из дробовика',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 25,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.SQUIREEL },
        { key: 'weaponName', value: WeaponType.SAWED },
      ],
    },
    {
      id: locationId + 'q5' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Make 3 double kills',
        ru: 'Сделать 3 двойных убийства',
      }),
      event: Game.Events.Stat.DubleKillEvent.Event,
      count: 3,
      conditions: []
    },
    {
      id: locationId + 'q5' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Earn 2000 points',
        ru: 'Заработать 2000 очков',
      }),
      event: Game.Events.Stat.EarnEvent.Event,
      valueKey: 'score',
      value: 2000,
      count: -1,
      conditions: []
    },
  ]
}

const group6: Quest.Config = {
  id: locationId + 'q6',
  tasks: [
    {
      id: locationId + 'q6' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Purchase M4',
        ru: 'Купить M4',
      }),
      event: Game.Events.Stat.PurchaseWeaponEvent.Event,
      count: 1,
      conditions: [
        { key: 'weaponName', value: WeaponType.M4 },
      ]
    },
    {
      id: locationId + 'q6' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Kill 30 hares with M4',
        ru: 'Убить 30 зайцев из M4',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 30,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.HARE },
        { key: 'weaponName', value: WeaponType.M4 },
      ],
    },
    {
      id: locationId + 'q6' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Complete fourth wave',
        ru: 'Завершить четвертую волну',
      }),
      event: Game.Events.Stat.WaveCompleteEvent.Event,
      count: 1,
      conditions: [
        { key: 'waveNumber', operator: '=', value: 4 },
      ]
    },
  ]
}

const group7: Quest.Config = {
  id: locationId + 'q7',
  tasks: [
    {
      id: locationId + 'q7' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Purchase grenade',
        ru: 'Купить гранату',
      }),
      event: Game.Events.Stat.PurchaseWeaponEvent.Event,
      count: 1,
      conditions: [
        { key: 'weaponName', value: WeaponType.GRENADE },
      ]
    },
    {
      id: locationId + 'q7' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Make 5 double kills with grenade',
        ru: 'Сделать 5 двойных убийств гранатой',
      }),
      event: Game.Events.Stat.DubleKillEvent.Event,
      count: 5,
      conditions: [
        { key: 'weaponName', value: WeaponType.GRENADE },
      ]
    },
    {
      id: locationId + 'q7' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Earn 3000 points',
        ru: 'Заработать 3000 очков',
      }),
      event: Game.Events.Stat.EarnEvent.Event,
      valueKey: 'score',
      value: 3000,
      count: -1,
      conditions: []
    },
  ]
}

const group8: Quest.Config = {
  id: locationId + 'q8',
  tasks: [
    {
      id: locationId + 'q8' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 10 capybaras',
        ru: 'Убить 10 капибар',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 10,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.CAPYBARA },
      ],
    },
    {
      id: locationId + 'q8' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Kill 40 squirrels with headshots',
        ru: 'Убить 40 белок выстрелами в голову',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 40,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.SQUIREEL },
        { key: 'body', value: 'head' },
      ],
    },
    {
      id: locationId + 'q8' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Complete fifth wave',
        ru: 'Завершить пятую волну',
      }),
      event: Game.Events.Stat.WaveCompleteEvent.Event,
      count: 1,
      conditions: [
        { key: 'waveNumber', value: 5, operator: '=' },
      ]
    },
  ]
}

const group9: Quest.Config = {
  id: locationId + 'q9',
  tasks: [
    {
      id: locationId + 'q9' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 20 wolves',
        ru: 'Убить 20 волков',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 20,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.WOLF },
      ],
    },
    {
      id: locationId + 'q9' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Kill 20 hares with AWP from distance',
        ru: 'Убить 20 зайцев из AWP с расстояния',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 20,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.HARE },
        { key: 'weaponName', value: WeaponType.AWP },
        { key: 'distance', operator: '>', value: 200 },
      ],
    },
    {
      id: locationId + 'q9' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Make a triple kill',
        ru: 'Сделать тройное убийство',
      }),
      event: Game.Events.Stat.TripleKillEvent.Event,
      count: 1,
      conditions: []
    },
  ]
}

const group10: Quest.Config = {
  id: locationId + 'q10',
  tasks: [
    {
      id: locationId + 'q10' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 6 deer',
        ru: 'Убить 6 оленей',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 6,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.DEER },
      ],
    },
    {
      id: locationId + 'q10' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Make 3 triple kills with launcher',
        ru: 'Сделать 3 тройных убийства ракетником',
      }),
      event: Game.Events.Stat.TripleKillEvent.Event,
      count: 3,
      conditions: [
        { key: 'weaponName', value: WeaponType.LAUNCHER },
      ]
    },
    {
      id: locationId + 'q10' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Earn 4000 points',
        ru: 'Заработать 4000 очков',
      }),
      event: Game.Events.Stat.EarnEvent.Event,
      valueKey: 'score',
      value: 4000,
      count: -1,
      conditions: []
    },
  ]
}

const group11: Quest.Config = {
  id: locationId + 'q11',
  tasks: [
    {
      id: locationId + 'q11' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 16 wolves with headshots',
        ru: 'Убить 16 волков в голову',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 16,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.WOLF },
        { key: 'body', value: 'head' },
      ],
    },
    {
      id: locationId + 'q11' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Kill 40 squirrels from a distance',
        ru: 'Убить 40 белок с дальней дистанции',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 40,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.SQUIREEL },
        { key: 'distance', value: 300, operator: '>' },
      ],
    },
    {
      id: locationId + 'q11' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Make 5 triple kills',
        ru: 'Сделать 5 тройных убийств',
      }),
      event: Game.Events.Stat.TripleKillEvent.Event,
      count: 5,
      conditions: []
    },
  ]
}

const group12: Quest.Config = {
  id: locationId + 'q12',
  tasks: [
    {
      id: locationId + 'q12' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 12 capybaras with one shot',
        ru: 'Убить 12 капибар с одного выстрела',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 12,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.CAPYBARA },
        { key: 'oneShotKill', value: true },
      ],
    },
    {
      id: locationId + 'q12' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Kill 4 deer from a distance',
        ru: 'Убить 4 оленей с дальней дистанции',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 4,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.DEER },
        { key: 'distance', value: 300, operator: '>' },
      ],
    },
    {
      id: locationId + 'q12' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Complete wave 5',
        ru: 'Пройти волну 5',
      }),
      event: Game.Events.Stat.WaveCompleteEvent.Event,
      count: 1,
      conditions: [
        { key: 'waveNumber', value: 5, operator: '=' },
      ],
    },
  ]
}

const group13: Quest.Config = {
  id: locationId + 'q13',
  tasks: [
    {
      id: locationId + 'q13' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 16 wolves with headshots',
        ru: 'Убить 16 волков в голову',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 16,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.WOLF },
        { key: 'body', value: 'head' },
      ],
    },
    {
      id: locationId + 'q13' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Kill 16 squirrels from distance',
        ru: 'Убить 16 белок с дальней дистанции',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 60,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.SQUIREEL },
        { key: 'distance', value: 500, operator: '>' },
      ],
    },
    {
      id: locationId + 'q13' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Make 7 triple kills',
        ru: 'Сделать 7 тройных убийств',
      }),
      event: Game.Events.Stat.TripleKillEvent.Event,
      count: 7,
      conditions: []
    },
  ]
}

const group14: Quest.Config = {
  id: locationId + 'q14',
  tasks: [
    {
      id: locationId + 'q14' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 50 hares with one shot',
        ru: 'Убить 50 зайцев с одного выстрела',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 50,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.HARE },
        { key: 'oneShotKill', value: true },
      ],
    },
    {
      id: locationId + 'q14' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Kill 14 capybaras from distance',
        ru: 'Убить 14 капибар с дальней дистанции',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 14,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.CAPYBARA },
        { key: 'distance', value: 400, operator: '>' },
      ],
    },
    {
      id: locationId + 'q14' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Complete wave 5',
        ru: 'Пройти волну 5',
      }),
      event: Game.Events.Stat.WaveCompleteEvent.Event,
      count: 1,
      conditions: [
        { key: 'waveNumber', value: 5, operator: '=' },
      ],
    },
  ]
}

const group15: Quest.Config = {
  id: locationId + 'q15',
  tasks: [
    {
      id: locationId + 'q15' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 3 deer with headshots',
        ru: 'Убить 3 оленя в голову',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 3,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.DEER },
        { key: 'body', value: 'head' },
      ],
    },
    {
      id: locationId + 'q15' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Kill 6 wolves from distance',
        ru: 'Убить 6 волков с дальней дистанции',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 6,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.WOLF },
        { key: 'distance', value: 600, operator: '>' },
      ],
    },
    {
      id: locationId + 'q15' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Make 10 triple kills',
        ru: 'Сделать 10 тройных убийств',
      }),
      event: Game.Events.Stat.TripleKillEvent.Event,
      count: 10,
      conditions: []
    },
  ]
}

const group16: Quest.Config = {
  id: locationId + 'q16',
  tasks: [
    {
      id: locationId + 'q16' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 50 hares with point-blank headshots',
        ru: 'Убить 50 зайцев выстрелами в голову в упор',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 50,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.HARE },
        { key: 'body', value: 'head' },
        { key: 'distance', operator: '<', value: 50 },
      ],
    },
    {
      id: locationId + 'q16' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Make 30 double kills',
        ru: 'Сделать 30 двойных убийств',
      }),
      event: Game.Events.Stat.DubleKillEvent.Event,
      count: 30,
      conditions: []
    },
    {
      id: locationId + 'q16' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Earn 7000 points',
        ru: 'Заработать 7000 очков',
      }),
      event: Game.Events.Stat.EarnEvent.Event,
      valueKey: 'score',
      value: 7000,
      count: -1,
      conditions: []
    },
  ]
}

const group17: Quest.Config = {
  id: locationId + 'q17',
  tasks: [
    {
      id: locationId + 'q17' + 't1',
      reward: { currency: Bank.Currency.Star, amount: 1 },
      title: I18n({
        en: 'Kill 50 squirrels with headshots from distance',
        ru: 'Убить 50 белок выстрелами в голову с расстояния',
      }),
      event: Game.Events.Stat.EnemyKillEvent.Event,
      count: 50,
      conditions: [
        { key: 'enemyType', value: Enemy.Type.SQUIREEL },
        { key: 'body', value: 'head' },
        { key: 'distance', operator: '>', value: 600 },
      ],
    },
    {
      id: locationId + 'q17' + 't2',
      reward: { currency: Bank.Currency.Star, amount: 2 },
      title: I18n({
        en: 'Make 35 double kills',
        ru: 'Сделать 35 двойных убийств',
      }),
      event: Game.Events.Stat.DubleKillEvent.Event,
      count: 35,
      conditions: []
    },
    {
      id: locationId + 'q17' + 't3',
      reward: { currency: Bank.Currency.Star, amount: 3 },
      title: I18n({
        en: 'Make 20 triple kills',
        ru: 'Сделать 20 тройных убийств',
      }),
      event: Game.Events.Stat.TripleKillEvent.Event,
      count: 20,
      conditions: []
    },
  ]
}

// const group18: Quest.Config = {
//   id: locationId + 'q18',
//   tasks: [
//     {
//       id: locationId + 'q18' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 90 hares with one shot from distance',
//         ru: 'Убить 90 зайцев одним выстрелом с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 90,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.HARE },
//         { key: 'oneShotKill', value: true },
//         { key: 'distance', operator: '>', value: 25 },
//       ],
//     },
//     {
//       id: locationId + 'q18' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 40 double kills',
//         ru: 'Сделать 40 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 40,
//       conditions: []
//     },
//     {
//       id: locationId + 'q18' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Earn 8000 points',
//         ru: 'Заработать 8000 очков',
//       }),
//       event: Game.Events.Stat.EarnEvent.Event,
//       valueKey: 'score',
//       value: 8000,
//       count: -1,
//       conditions: []
//     },
//   ]
// }

// const group19: Quest.Config = {
//   id: locationId + 'q19',
//   tasks: [
//     {
//       id: locationId + 'q19' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 100 squirrels with one shot from distance',
//         ru: 'Убить 100 белок одним выстрелом с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 100,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.SQUIREEL },
//         { key: 'oneShotKill', value: true },
//         { key: 'distance', operator: '>', value: 25 },
//       ],
//     },
//     {
//       id: locationId + 'q19' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 45 double kills',
//         ru: 'Сделать 45 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 45,
//       conditions: []
//     },
//     {
//       id: locationId + 'q19' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Make 25 triple kills',
//         ru: 'Сделать 25 тройных убийств',
//       }),
//       event: Game.Events.Stat.TripleKillEvent.Event,
//       count: 25,
//       conditions: []
//     },
//   ]
// }

// const group20: Quest.Config = {
//   id: locationId + 'q20',
//   tasks: [
//     {
//       id: locationId + 'q20' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 110 hares with headshots from distance',
//         ru: 'Убить 110 зайцев выстрелами в голову с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 110,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.HARE },
//         { key: 'body', value: 'head' },
//         { key: 'distance', operator: '>', value: 30 },
//       ],
//     },
//     {
//       id: locationId + 'q20' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 50 double kills',
//         ru: 'Сделать 50 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 50,
//       conditions: []
//     },
//     {
//       id: locationId + 'q20' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Earn 9000 points',
//         ru: 'Заработать 9000 очков',
//       }),
//       event: Game.Events.Stat.EarnEvent.Event,
//       valueKey: 'score',
//       value: 9000,
//       count: -1,
//       conditions: []
//     },
//   ]
// }

// const group21: Quest.Config = {
//   id: locationId + 'q21',
//   tasks: [
//     {
//       id: locationId + 'q21' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 120 squirrels with headshots from distance',
//         ru: 'Убить 120 белок выстрелами в голову с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 120,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.SQUIREEL },
//         { key: 'body', value: 'head' },
//         { key: 'distance', operator: '>', value: 30 },
//       ],
//     },
//     {
//       id: locationId + 'q21' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 55 double kills',
//         ru: 'Сделать 55 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 55,
//       conditions: []
//     },
//     {
//       id: locationId + 'q21' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Make 30 triple kills',
//         ru: 'Сделать 30 тройных убийств',
//       }),
//       event: Game.Events.Stat.TripleKillEvent.Event,
//       count: 30,
//       conditions: []
//     },
//   ]
// }

// const group22: Quest.Config = {
//   id: locationId + 'q22',
//   tasks: [
//     {
//       id: locationId + 'q22' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 130 hares with one shot from distance',
//         ru: 'Убить 130 зайцев одним выстрелом с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 130,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.HARE },
//         { key: 'oneShotKill', value: true },
//         { key: 'distance', operator: '>', value: 35 },
//       ],
//     },
//     {
//       id: locationId + 'q22' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 60 double kills',
//         ru: 'Сделать 60 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 60,
//       conditions: []
//     },
//     {
//       id: locationId + 'q22' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Earn 10000 points',
//         ru: 'Заработать 10000 очков',
//       }),
//       event: Game.Events.Stat.EarnEvent.Event,
//       valueKey: 'score',
//       value: 10000,
//       count: -1,
//       conditions: []
//     },
//   ]
// }

// const group23: Quest.Config = {
//   id: locationId + 'q23',
//   tasks: [
//     {
//       id: locationId + 'q23' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 140 squirrels with one shot from distance',
//         ru: 'Убить 140 белок одним выстрелом с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 140,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.SQUIREEL },
//         { key: 'oneShotKill', value: true },
//         { key: 'distance', operator: '>', value: 35 },
//       ],
//     },
//     {
//       id: locationId + 'q23' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 65 double kills',
//         ru: 'Сделать 65 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 65,
//       conditions: []
//     },
//     {
//       id: locationId + 'q23' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Make 35 triple kills',
//         ru: 'Сделать 35 тройных убийств',
//       }),
//       event: Game.Events.Stat.TripleKillEvent.Event,
//       count: 35,
//       conditions: []
//     },
//   ]
// }

// const group24: Quest.Config = {
//   id: locationId + 'q24',
//   tasks: [
//     {
//       id: locationId + 'q24' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 150 hares with headshots from distance',
//         ru: 'Убить 150 зайцев выстрелами в голову с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 150,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.HARE },
//         { key: 'body', value: 'head' },
//         { key: 'distance', operator: '>', value: 40 },
//       ],
//     },
//     {
//       id: locationId + 'q24' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 70 double kills',
//         ru: 'Сделать 70 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 70,
//       conditions: []
//     },
//     {
//       id: locationId + 'q24' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Earn 11000 points',
//         ru: 'Заработать 11000 очков',
//       }),
//       event: Game.Events.Stat.EarnEvent.Event,
//       valueKey: 'score',
//       value: 11000,
//       count: -1,
//       conditions: []
//     },
//   ]
// }

// const group25: Quest.Config = {
//   id: locationId + 'q25',
//   tasks: [
//     {
//       id: locationId + 'q25' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 160 squirrels with headshots from distance',
//         ru: 'Убить 160 белок выстрелами в голову с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 160,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.SQUIREEL },
//         { key: 'body', value: 'head' },
//         { key: 'distance', operator: '>', value: 40 },
//       ],
//     },
//     {
//       id: locationId + 'q25' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 75 double kills',
//         ru: 'Сделать 75 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 75,
//       conditions: []
//     },
//     {
//       id: locationId + 'q25' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Make 40 triple kills',
//         ru: 'Сделать 40 тройных убийств',
//       }),
//       event: Game.Events.Stat.TripleKillEvent.Event,
//       count: 40,
//       conditions: []
//     },
//   ]
// }

// const group26: Quest.Config = {
//   id: locationId + 'q26',
//   tasks: [
//     {
//       id: locationId + 'q26' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 170 hares with one shot from distance',
//         ru: 'Убить 170 зайцев одним выстрелом с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 170,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.HARE },
//         { key: 'oneShotKill', value: true },
//         { key: 'distance', operator: '>', value: 45 },
//       ],
//     },
//     {
//       id: locationId + 'q26' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 80 double kills',
//         ru: 'Сделать 80 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 80,
//       conditions: []
//     },
//     {
//       id: locationId + 'q26' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Earn 12000 points',
//         ru: 'Заработать 12000 очков',
//       }),
//       event: Game.Events.Stat.EarnEvent.Event,
//       valueKey: 'score',
//       value: 12000,
//       count: -1,
//       conditions: []
//     },
//   ]
// }

// const group27: Quest.Config = {
//   id: locationId + 'q27',
//   tasks: [
//     {
//       id: locationId + 'q27' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 180 squirrels with one shot from distance',
//         ru: 'Убить 180 белок одним выстрелом с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 180,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.SQUIREEL },
//         { key: 'oneShotKill', value: true },
//         { key: 'distance', operator: '>', value: 45 },
//       ],
//     },
//     {
//       id: locationId + 'q27' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 85 double kills',
//         ru: 'Сделать 85 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 85,
//       conditions: []
//     },
//     {
//       id: locationId + 'q27' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Make 45 triple kills',
//         ru: 'Сделать 45 тройных убийств',
//       }),
//       event: Game.Events.Stat.TripleKillEvent.Event,
//       count: 45,
//       conditions: []
//     },
//   ]
// }

// const group28: Quest.Config = {
//   id: locationId + 'q28',
//   tasks: [
//     {
//       id: locationId + 'q28' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 190 hares with headshots from distance',
//         ru: 'Убить 190 зайцев выстрелами в голову с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 190,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.HARE },
//         { key: 'body', value: 'head' },
//         { key: 'distance', operator: '>', value: 50 },
//       ],
//     },
//     {
//       id: locationId + 'q28' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 90 double kills',
//         ru: 'Сделать 90 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 90,
//       conditions: []
//     },
//     {
//       id: locationId + 'q28' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Earn 13000 points',
//         ru: 'Заработать 13000 очков',
//       }),
//       event: Game.Events.Stat.EarnEvent.Event,
//       valueKey: 'score',
//       value: 13000,
//       count: -1,
//       conditions: []
//     },
//   ]
// }

// const group29: Quest.Config = {
//   id: locationId + 'q29',
//   tasks: [
//     {
//       id: locationId + 'q29' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 200 squirrels with one shot from distance',
//         ru: 'Убить 200 белок одним выстрелом с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 200,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.SQUIREEL },
//         { key: 'oneShotKill', value: true },
//         { key: 'distance', operator: '>', value: 50 },
//       ],
//     },
//     {
//       id: locationId + 'q29' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 95 double kills',
//         ru: 'Сделать 95 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 95,
//       conditions: []
//     },
//     {
//       id: locationId + 'q29' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Make 50 triple kills',
//         ru: 'Сделать 50 тройных убийств',
//       }),
//       event: Game.Events.Stat.TripleKillEvent.Event,
//       count: 50,
//       conditions: []
//     },
//   ]
// }

// const group30: Quest.Config = {
//   id: locationId + 'q30',
//   tasks: [
//     {
//       id: locationId + 'q30' + 't1',
//       reward: { currency: Bank.Currency.Star, amount: 1 },
//       title: I18n({
//         en: 'Kill 210 hares with headshots from distance',
//         ru: 'Убить 210 зайцев выстрелами в голову с расстояния',
//       }),
//       event: Game.Events.Stat.EnemyKillEvent.Event,
//       count: 210,
//       conditions: [
//         { key: 'enemyType', value: Enemy.Type.HARE },
//         { key: 'body', value: 'head' },
//         { key: 'distance', operator: '>', value: 55 },
//       ],
//     },
//     {
//       id: locationId + 'q30' + 't2',
//       reward: { currency: Bank.Currency.Star, amount: 2 },
//       title: I18n({
//         en: 'Make 100 double kills',
//         ru: 'Сделать 100 двойных убийств',
//       }),
//       event: Game.Events.Stat.DubleKillEvent.Event,
//       count: 100,
//       conditions: []
//     },
//     {
//       id: locationId + 'q30' + 't3',
//       reward: { currency: Bank.Currency.Star, amount: 3 },
//       title: I18n({
//         en: 'Earn 15000 points',
//         ru: 'Заработать 15000 очков',
//       }),
//       event: Game.Events.Stat.EarnEvent.Event,
//       valueKey: 'score',
//       value: 15000,
//       count: -1,
//       conditions: []
//     },
//   ]
// }

export const quests: Quest.Config[] = [
  group1,
  group2,
  group3,
  group4,
  group5,
  group6,
  group7,
  group8,
  group9,
  group10,
  group11,
  group12,
  group13,
  group14,
  group15,
  group16,
  group17,
  // group18,
  // group19,
  // group20,
  // group21,
  // group22,
  // group23,
  // group24,
  // group25,
  // group26,
  // group27,
  // group28,
  // group29,
  // group30,
]
