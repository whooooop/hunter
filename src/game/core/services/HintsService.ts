import { I18n, I18nReturnType } from "../../../utils/i18n";

export class HintsService {
  private static instance: HintsService;
  private hints: I18nReturnType<string>[] = [];

  constructor() {
    this.hints = [
      I18n({
        en: 'The first step to success is to believe in yourself.',
        ru: 'Первый шаг к успеху - это поверить в себя.',
      }),
      I18n({
        en: 'Headshot from pistol gives additional points',
        ru: 'Попадание в голову из пистолета дает дополнительные очки',
      }),
      I18n({
        en: 'Bullets passing through trees deal less damage',
        ru: 'Пули проходящие через деревья, наносят меньший урон',
      }),
      I18n({
        en: 'Headshot deals more damage',
        ru: 'Попадание в голову нанасит больший урон',
      }),
      I18n({
        en: 'Grenade deals area damage',
        ru: 'Граната наносит урон в радиусе',
      }),
    ];
  }

  static getInstance(): HintsService {
    if (!HintsService.instance) {
      HintsService.instance = new HintsService();
    }
    return HintsService.instance;
  }

  async getHint(): Promise<string> {
    return this.hints[Math.floor(Math.random() * this.hints.length)].translate;
  }
}