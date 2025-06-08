import { Bank, Enemy, Game, Quest } from "../../types";
import { I18n } from "../../utils/i18n";
import { WeaponType } from "../../weapons/WeaponTypes";

export const quests: Quest.Config[] = [
  {
    id: 'lfq1',
    tasks: [
      {
        id: 'lfq1t1',
        reward: { currency: Bank.Currency.Star, amount: 1 },
        title: I18n({
          en: 'Kill 5 hares',
          ru: 'Убить 5 зайцев',
        }),
        event: Game.Events.Stat.EnemyKillEvent.Event,
        count: 5,
        conditions: [
          { key: 'enemyType', value: Enemy.Type.HARE },
        ],
      },
      {
        id: 'lfq1t2',
        reward: { currency: Bank.Currency.Star, amount: 2 },
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
        reward: { currency: Bank.Currency.Star, amount: 3 },
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
        id: 'lfq1t1',
        reward: { currency: Bank.Currency.Star, amount: 1 },
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
      {
        id: 'lfq2t1',
        reward: { currency: Bank.Currency.Star, amount: 2 },
        title: I18n({
          en: 'Kill 15 rabbits',
          ru: 'Убить 15 кроликов',
        }),
        event: Game.Events.Stat.EnemyKillEvent.Event,
        count: 15,
        conditions: [
          { key: 'enemyType', value: Enemy.Type.SQUIREEL },
        ],
      },
      {
        id: 'lfq2t2',
        reward: { currency: Bank.Currency.Star, amount: 3 },
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

const weaponsQuests = [
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
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
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
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
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
    id: 'lfq1t1',
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
    id: 'lfq1t1',
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
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Purchase mine',
      ru: 'Купить мину',
    }),
    event: Game.Events.Stat.PurchaseWeaponEvent.Event,
    count: 1,
    conditions: [
      { key: 'weaponName', value: WeaponType.MINE },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Purchase AWP',
      ru: 'Купить AWP',
    }),
    event: Game.Events.Stat.PurchaseWeaponEvent.Event,
    count: 1,
    conditions: [
      { key: 'weaponName', value: WeaponType.AWP },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Purchase launcher',
      ru: 'Купить ракетник',
    }),
    event: Game.Events.Stat.PurchaseWeaponEvent.Event,
    count: 1,
    conditions: [
      { key: 'weaponName', value: WeaponType.LAUNCHER },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Purchase machine gun',
      ru: 'Купить пулемет',
    }),
    event: Game.Events.Stat.PurchaseWeaponEvent.Event,
    count: 1,
    conditions: [
      { key: 'weaponName', value: WeaponType.MACHINE },
    ]
  }
]

const KillQuests = [
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 hares',
      ru: 'Убить 10 зайцев',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.HARE },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 squirels',
      ru: 'Убить 10 белок',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.SQUIREEL },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 capybaras',
      ru: 'Убить 10 капибар',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.CAPYBARA },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 capybaras',
      ru: 'Убить 10 капибар',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.WOLF },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 deer',
      ru: 'Убить 10 оленей',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.DEER },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill a bear',
      ru: 'Убить медведя',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 1,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.BEAR },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 baby deer',
      ru: 'Убить 10 маленьких оленей',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.DEER_BABY },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 hedgehogs',
      ru: 'Убить 10 ежей',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.HEDGEHOG },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 skunks',
      ru: 'Убить 10 скунсов',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.RACCOON },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 mice',
      ru: 'Убить 10 мышей',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.MOUSE },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 wolves',
      ru: 'Убить 10 волков',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.WOLF },
    ]
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Kill 10 angry squirrels',
      ru: 'Убить 10 злых белок',
    }),
    event: Game.Events.Stat.EnemyKillEvent.Event,
    count: 10,
    conditions: [
      { key: 'enemyType', value: Enemy.Type.SQUIRREL_ANGRY },
    ]
  }
]

const otherQuests = [
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Make a double kill',
      ru: 'Сделать двойную смерть',
    }),
    event: Game.Events.Stat.DubleKillEvent.Event,
    count: 1,
    conditions: []
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Make a triple kill',
      ru: 'Сделать тройную смерть',
    }),
    event: Game.Events.Stat.TripleKillEvent.Event,
    count: 1,
  },
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
    title: I18n({
      en: 'Earn 5000 coins',
      ru: 'Накопить 5000 монеток',
    }),
    event: Game.Events.Stat.EarnEvent.Event,
    valueKey: 'score',
    value: 5000,
    count: -1,
    conditions: []
  },
  {
    id: 'lfq1t3',
    reward: { currency: Bank.Currency.Star, amount: 3 },
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
  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 1 },
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
  {
    id: 'lfq1t3',
    reward: { currency: Bank.Currency.Star, amount: 3 },
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

  {
    id: 'lfq1t1',
    reward: { currency: Bank.Currency.Star, amount: 3 },
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