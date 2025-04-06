import { LocationType, EnemyType } from './Constants';

// Настройки волны врагов
export interface WaveConfig {
  enemies: Array<{
    type: EnemyType;
    count: number;
    spawnInterval: number; // Интервал между спавном врагов в мс
  }>;
  duration: number; // Длительность волны в мс
}

// Настройки уровня
export interface LevelConfig {
  id: number;
  name: string;
  location: LocationType;
  waves: WaveConfig[];
  victoryCondition?: {
    type: 'surviveAllWaves' | 'killAllEnemies' | 'time';
    value?: number; // Для условия по времени
  };
}

export class Level {
  private config: LevelConfig;
  
  constructor(config: LevelConfig) {
    this.config = config;
  }
  
  public getId(): number {
    return this.config.id;
  }
  
  public getName(): string {
    return this.config.name;
  }
  
  public getLocation(): LocationType {
    return this.config.location;
  }
  
  public getWaves(): WaveConfig[] {
    return this.config.waves;
  }
  
  public getVictoryCondition(): LevelConfig['victoryCondition'] {
    return this.config.victoryCondition;
  }
  
  // Метод для получения волны по индексу
  public getWave(index: number): WaveConfig | null {
    if (index >= 0 && index < this.config.waves.length) {
      return this.config.waves[index];
    }
    return null;
  }
  
  // Метод для проверки, последняя ли это волна
  public isLastWave(index: number): boolean {
    return index === this.config.waves.length - 1;
  }
  
  // Метод для получения количества волн
  public getWavesCount(): number {
    return this.config.waves.length;
  }
} 