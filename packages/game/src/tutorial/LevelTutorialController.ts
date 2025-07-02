import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer";
import { LevelController } from "../controllers/LevelController";
import { EnemyEntity } from "../entities/EnemyEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { emitEvent, offEvent, onEvent } from "../GameEvents";
import { GameplayScene } from "../scenes/Gameplay";
import { enemyStateCollection } from "../storage/collections/enemyState.collection";
import { Controls, Enemy, Game, Shop, ShopEvents } from '../types';
import { UiArrow, UiTutorialMessage } from "../ui";
import { I18n } from "../utils/i18n";
import { WeaponType } from "../weapons/WeaponTypes";
import { continueText } from "./translates";

export class LevelTutorialController extends LevelController {

  private depth: number = 800;

  static preload(scene: Phaser.Scene): void {
    UiArrow.preload(scene);
    LevelController.preload(scene);
    UiTutorialMessage.preload(scene);
  }

  constructor(
    scene: GameplayScene,
    storage: StorageSpace,
    players: Map<string, PlayerEntity>,
    enemies: Map<string, EnemyEntity>
  ) {
    super(scene, storage, players, enemies);
  }

  async start(): Promise<void> {
    await this.stepWelcome();
    await this.stepMove();
    await this.stepMoveComplete();
    await this.stepWeapon();
    await this.stepGiveWeapon();
    await this.stepWeaponShoot();
    await this.stepWeaponReload();
    await this.stepKillHare();
    await this.stepShowScore();
    await this.stepOpenShop();
    await this.stepBuyWeapon();
    await this.stepSquirelAttention();
    await this.stepKillSquirel();
    await this.stepFinish();
  }

  async waitReady(): Promise<void> {
    return Promise.resolve();
  }

  gameOver(): void {
    this.scene.stopGame();
    this.stepGameOver();
  }

  stepWelcome(): Promise<void> {
    const text = I18n({
      en: 'Let’s quickly figure out what’s going on here — before the squirrels start holding a meeting! 🐿️💥',
      ru: 'Давай мигом разберёмся, что тут происходит — пока белки не начали устраивать собрание! 🐿️💥',
    });
    return new Promise((resolve) => {
      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: text.translate,
        buttonText: continueText.translate,
        callback: async () => {
          await tutorialMessage.hide();
          tutorialMessage.destroy();
          resolve();
        },
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();
    });
  }

  stepMove(): Promise<void> {
    const textDesktop = I18n({
      en: 'Use the WASD keys or the arrow keys and stretch your legs — run in all directions and show who’s boss of the movement! 🕹️💨',
      ru: 'Используй клавиши WASD или стрелки и хорошенько размни ноги — пробегись во всех направлениях, покажи, кто тут командует движением! 🕹️💨',
    });

    const textMobile = I18n({
      en: 'Use the left joystick and stretch your legs — run in all directions and show who’s in control of the movement! 🕹️💨',
      ru: 'Используй левый джойстик и хорошенько размни ноги — пробегись во всех направлениях, покажи, кто тут командует движением! 🕹️💨',
    });

    return new Promise((resolve) => {
      const completed = new Map<string, number>([
        ['up', 0],
        ['down', 0],
        ['left', 0],
        ['right', 0],
      ]);

      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: this.scene.sys.game.device.os.desktop ? textDesktop.translate : textMobile.translate,
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();

      const completeFunction = (key: string) => {
        completed.set(key, completed.get(key)! + 1);
        if (Array.from(completed.values()).every(value => value >= 3)) {
          tutorialMessage.hide();
          tutorialMessage.destroy();
          offEvent(this.scene, Controls.Events.KeyUp.Event, completeUp, this);
          offEvent(this.scene, Controls.Events.KeyDown.Event, completeDown, this);
          offEvent(this.scene, Controls.Events.KeyLeft.Event, completeLeft, this);
          offEvent(this.scene, Controls.Events.KeyRight.Event, completeRight, this);
          resolve();
        }
      }

      const completeUp = () => completeFunction('up');
      const completeDown = () => completeFunction('down');
      const completeLeft = () => completeFunction('left');
      const completeRight = () => completeFunction('right');

      onEvent(this.scene, Controls.Events.KeyUp.Event, completeUp, this);
      onEvent(this.scene, Controls.Events.KeyDown.Event, completeDown, this);
      onEvent(this.scene, Controls.Events.KeyLeft.Event, completeLeft, this);
      onEvent(this.scene, Controls.Events.KeyRight.Event, completeRight, this);
    });
  }

  stepMoveComplete(): Promise<void> {
    const text = I18n({
      en: 'You’ve got real talent — like you were born with a joystick in your hands! 🎮✨',
      ru: 'Да у тебя настоящий талант — будто родился с джойстиком в руках! 🎮✨',
    });

    return new Promise((resolve) => {
      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: text.translate,
        buttonText: continueText.translate,
        callback: async () => {
          await tutorialMessage.hide();
          tutorialMessage.destroy();
          resolve();
        },
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();
    });
  }

  stepWeapon(): Promise<void> {
    const text = I18n({
      en: 'Pistol in hand — time to punish those squirrels! 💥🐿️',
      ru: 'Пистолет в руки — время белок наказывать! 💥🐿️',
    });

    return new Promise((resolve) => {
      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: text.translate,
        buttonText: continueText.translate,
        callback: async () => {
          await tutorialMessage.hide();
          tutorialMessage.destroy();
          resolve();
        },
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();
    });
  }

  stepGiveWeapon(): Promise<void> {
    return new Promise((resolve) => {
      this.players.forEach((player: PlayerEntity, playerId: string) => {
        emitEvent(this.scene, ShopEvents.WeaponPurchasedEvent, { playerId, weaponType: WeaponType.GLOCK, price: 0 });
      });
      resolve();
    });
  }

  stepWeaponShoot(): Promise<void> {
    const textDesktop = I18n({
      en: 'Show off your skills — shoot a bit, press the F key',
      ru: 'Покажи класс — постреляй немного, жми на кнопку F',
    });

    const textMobile = I18n({
      en: 'Show off your skills — shoot a bit, use the right part of the screen',
      ru: 'Покажи класс — постреляй немного, используй правую часть экрана',
    });

    return new Promise((resolve) => {
      let counter = 6;
      let activated = false;

      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: this.scene.sys.game.device.os.desktop ? textDesktop.translate : textMobile.translate,
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();

      const complete = async ({ active }: { active: boolean }) => {
        if (!activated && active) {
          activated = true;
          counter--;
        } else if (!active && activated) {
          activated = false;
        }

        if (counter === 0) {
          offEvent(this.scene, Controls.Events.Fire.Event, complete, this);
          await tutorialMessage.hide();
          tutorialMessage.destroy();
          resolve();
        }
      }
      onEvent(this.scene, Controls.Events.Fire.Event, complete, this);
    });
  }

  stepWeaponReload(): Promise<void> {
    const textDesktop = I18n({
      en: 'Whoa, take it easy! Reload your pistol — hit R or tap the weapon icon! 🔄🔫',
      ru: 'Воу-воу, полегче! Перезаряди писторел — жми R или тапай по иконке оружия! 🔄🔫',
    });

    const textMobile = I18n({
      en: 'Whoa, take it easy! Reload your pistol — tap the weapon icon! 🔄🔫',
      ru: 'Воу-воу, полегче! Перезаряди писторел — тапай по иконке оружия! 🔄🔫',
    });

    return new Promise((resolve) => {
      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: this.scene.sys.game.device.os.desktop ? textDesktop.translate : textMobile.translate,
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();

      const complete = async () => {
        offEvent(this.scene, Controls.Events.Reload.Event, complete, this);
        await tutorialMessage.hide();
        tutorialMessage.destroy();
        resolve();
      }
      onEvent(this.scene, Controls.Events.Reload.Event, complete, this);
    });
  }

  stepKillHare(): Promise<void> {
    const text = I18n({
      en: 'Awesome! Time to prove your hands are in the right place — shoot that floppy-eared hare! 🐰🎯',
      ru: 'Отлично! Самое время показать, что твои руки растут откуда надо — подстрели этого ушастого зайца! 🐰🎯',
    });

    return new Promise((resolve) => {
      let timer: Phaser.Time.TimerEvent;

      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: text.translate,
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();

      const complete = async () => {
        this.storage.getCollection<Enemy.State>(enemyStateCollection)?.unsubscribe('Remove', complete);
        if (timer) {
          timer.destroy();
        }
        await tutorialMessage.hide();
        tutorialMessage.destroy();
        resolve();
      }

      this.storage.getCollection<Enemy.State>(enemyStateCollection)?.subscribe('Remove', complete);
      this.scene.time.delayedCall(1000, () => {
        this.scene.waveStart();
        timer = this.scene.time.delayedCall(7000, () => {
          const hare = this.enemies.values().next().value;
          if (hare) {
            hare.setMoveSpeed(0, 0);
          }
        });
      });
    });
  }

  stepShowScore(): Promise<void> {
    const text = I18n({
      en: 'You’re a born sniper! Every kill earns you coins, and with your stash, you can hit the shop and grab something way cooler. 🎯💰',
      ru: 'Ты прирожденный снайпер! За каждого убитого получаешь монетки, а на накопленое можно заглянуть в магазин и прикупить что-то по-круче. 🎯💰',
    });

    return new Promise((resolve) => {
      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: text.translate,
        buttonText: continueText.translate,
        callback: async () => {
          await tutorialMessage.hide();
          tutorialMessage.destroy();
          arrow.destroy();
          resolve();
        },
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();

      const arrow = new UiArrow(this.scene, 710, 150).setRotation(90).setDepth(this.depth);
      this.scene.tweens.add({
        targets: arrow,
        x: { from: 710, to: 700 },
        y: { from: 150, to: 160 },
        duration: 150,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
      this.scene.add.existing(arrow);
    });
  }

  stepOpenShop(): Promise<void> {
    const text = I18n({
      en: 'Go to the tent and press E — or just tap on the icon when you are near. Cool gear awaits inside!',
      ru: 'Подойди к палатке и жми E — или просто тыкни по иконке, когда окажешься рядом. Внутри тебя ждёт снаряга!',
    });

    return new Promise((resolve) => {
      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: text.translate,
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();

      const arrow = new UiArrow(this.scene, 130, 50).setRotation(Math.PI / 0.26).setDepth(this.depth);
      this.scene.tweens.add({
        targets: arrow,
        x: { from: 130, to: 140 },
        y: { from: 50, to: 40 },
        duration: 150,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
      this.scene.add.existing(arrow);

      const complete = async ({ opened }: { opened: boolean }) => {
        if (!opened) {
          return;
        }

        offEvent(this.scene, Shop.Events.Opened.Event, complete, this);
        arrow.destroy();
        await tutorialMessage.hide();
        tutorialMessage.destroy();
        resolve();
      }
      onEvent(this.scene, Shop.Events.Opened.Event, complete, this);
    });
  }

  stepBuyWeapon(): Promise<void> {
    const text = I18n({
      en: 'Use the movement buttons to navigate quickly and the fire button to buy.',
      ru: 'Используй кнопки перемещения для быстрой навигации и кнопку выстрела для покупки.',
    });

    return new Promise((resolve) => {
      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: text.translate,
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();

      const complete = async () => {
        offEvent(this.scene, ShopEvents.WeaponPurchasedEvent, complete, this);
        await tutorialMessage.hide();
        tutorialMessage.destroy();
        resolve();
      }
      onEvent(this.scene, ShopEvents.WeaponPurchasedEvent, complete, this);
    });
  }

  stepSquirelAttention(): Promise<void> {
    const text = I18n({
      en: 'Looks like there’s a whole horde of angry squirrels over there! They’ve sharpened their teeth — and it’s definitely not for cracking nuts… Quick — grab your weapon and show them who the real hunter! 💥🐿️',
      ru: 'Похоже, вон там целая орда злобных белок! Они уже наточили зубы и явно не для орешков… Быстрее — хватай оружие и покажи им, кто тут настоящий охотник! 💥🐿️',
    });

    return new Promise((resolve) => {
      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: text.translate,
        buttonText: continueText.translate,
        callback: async () => {
          await tutorialMessage.hide();
          tutorialMessage.destroy();
          resolve();
        },
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();
    });
  }

  stepKillSquirel(): Promise<void> {
    this.scene.waveContinue();
    let kills = 0;

    return new Promise((resolve) => {
      const complete = async (enemyId: string, record: SyncCollectionRecord<Enemy.State>) => {
        if (record.data.x > 0) {
          kills++;
        }
        if (kills >= 3 && !this.scene.isGameOver) {
          this.storage.getCollection<Enemy.State>(enemyStateCollection)?.unsubscribe('Remove', complete);
          resolve();
        }
      }
      this.storage.getCollection<Enemy.State>(enemyStateCollection)?.subscribe('Remove', complete);
    });
  }

  stepFinish(): Promise<void> {
    const text = I18n({
      en: 'Wow, you did great! No time to relax — head out and defend the village before it turns into a forest salad! 🏃‍♂️🔥',
      ru: 'Ух, ты отлично справился! Не время расслабляться — выдвигайся и защити деревню, пока она не превратилась в лесной салат! 🏃‍♂️🔥',
    });

    return new Promise((resolve) => {
      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: text.translate,
        buttonText: continueText.translate,
        callback: async () => {
          await tutorialMessage.hide();
          tutorialMessage.destroy();
          resolve();
          emitEvent(this.scene, Game.Events.Exit.Local, {});
        },
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();
    });
  }

  stepGameOver(): Promise<void> {
    const text = I18n({
      en: 'It’s not over yet! Let’s try again!',
      ru: 'Так дело не пойдет, давай попробуем еще разок!',
    });

    return new Promise((resolve) => {
      const tutorialMessage = new UiTutorialMessage(this.scene, {
        text: text.translate,
        buttonText: continueText.translate,
        callback: async () => {
          await tutorialMessage.hide();
          tutorialMessage.destroy();
          resolve();
          this.scene.replay();
        },
      }).setDepth(this.depth);
      this.scene.add.existing(tutorialMessage);
      tutorialMessage.show();
    });
  }
}
