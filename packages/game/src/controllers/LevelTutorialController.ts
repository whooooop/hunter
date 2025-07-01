// Давай научимся перемещаться по карте, пробегись во всех направлениях используя кнопки WASD или стрелки
// Отлично, видно что у тебя талант.
// Кажется тебе можно доверить оружие, держи писторел.
// Покажи что ты умеешь, постреляй немного, используй кнопку F
// Воу воу, парень, полегче. Не забывай перезаряжать оружие, нажми на кнопку R или на иконку оружия
// Отлично, самое время доказать что у тебя руки растут из нужного места, подстрели зайца.
// Да ты приражденный снайпер. За то что ты подстрелил зайца, ты получил вознаграждение, теперь на эти бабки ты можешь взять оружие посерьезней в магазине. Иди и сделай это.
// Перед тем как отправить тебя по бойню, докажи что ты не растеряешься стаи белок. Подстрели этих засранцев.

import { StorageSpace } from "@hunter/multiplayer";
import { EnemyEntity } from "../entities/EnemyEntity";
import { GameplayScene } from "../scenes/Gameplay";
import { LevelController } from "./LevelController";

export class LevelTutorialController extends LevelController {
  private resolver: (value: void | PromiseLike<void>) => void = () => { };

  constructor(
    scene: GameplayScene,
    storage: StorageSpace,
    enemies: Map<string, EnemyEntity>
  ) {
    super(scene, storage, enemies);
  }

  async start(): Promise<void> {
    console.log('start tutorial');
  }
}
