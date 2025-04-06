import { Level, LevelConfig } from "../core/Level";
import { LocationType, EnemyType } from "../core/Constants";

export class LevelOne extends Level {
  constructor() {
    const config: LevelConfig = {
      id: 1,
      name: "Первое вторжение в лес",
      location: LocationType.FOREST,
      waves: [
        {
          enemies: [
            {
              type: EnemyType.SQUIRREL,
              count: 5,
              spawnInterval: 2000 // 2 секунды между спавном
            }
          ],
          duration: 20000 // 20 секунд
        },
        {
          enemies: [
            {
              type: EnemyType.SQUIRREL,
              count: 8,
              spawnInterval: 1500 // 1.5 секунды между спавном
            },
            {
              type: EnemyType.MOOSE,
              count: 2,
              spawnInterval: 5000 // 5 секунд между спавном
            }
          ],
          duration: 30000 // 30 секунд
        },
        {
          enemies: [
            {
              type: EnemyType.SQUIRREL,
              count: 10,
              spawnInterval: 1000 // 1 секунда между спавном
            },
            {
              type: EnemyType.MOOSE,
              count: 3,
              spawnInterval: 4000 // 4 секунды между спавном
            },
            {
              type: EnemyType.BEAR,
              count: 1,
              spawnInterval: 0 // Спавнится сразу
            }
          ],
          duration: 40000 // 40 секунд
        }
      ],
      victoryCondition: {
        type: 'surviveAllWaves'
      }
    };
    
    super(config);
  }
} 