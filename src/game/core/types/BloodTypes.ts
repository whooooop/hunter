export namespace Blood {
  export namespace Events {
    export namespace BloodSplash {
      export const Local = 'blood:splash:local';
      export type Payload = {
        x: number;
        y: number;
        originPoint: { x: number, y: number };
        config: BloodSplashConfig;
      };
    }

    export namespace ScreenBloodSplash {
      export const Local = 'blood:screen:splash:local';
      export type Payload = {
        config?: ScreenBloodSplashConfig;
      };
    }
  }

  export interface BloodSplashConfig {
    amount?: number;           // Количество частиц
    size?: {                   // Размер частиц
        min: number;           // Минимальный размер (масштаб)
        max: number;           // Максимальный размер (масштаб)
    };
    speed?: {                  // Скорость частиц
        min: number;           // Минимальная начальная скорость
        max: number;           // Максимальная начальная скорость
        multiplier: number;    // Множитель скорости (0-1 для замедления, >1 для ускорения)
    };
    gravity?: number;          // Сила гравитации
    spread?: {                 // Разброс частиц
        angle: number;         // Угол разброса по горизонтали (в радианах)
    };
    initialVelocityY?: {       // Начальная вертикальная скорость
        min: number;           // Минимальное значение
        max: number;           // Максимальное значение
    };
    fallDistance?: {           // Максимальная дистанция падения
        min: number;          
        max: number;
        factor: number;
    };
    drag?: {                   // Сопротивление воздуха
        x: number;
        y: number;
    };
    alpha?: {                  // Прозрачность
        min: number;
        max: number;
    };
    force?: number;            // Сила частицы
    depth?: number;            // Приоритет отображения частиц (фиксированная глубина)
    texture?: Texture;      // Тип текстуры ('basic', 'drops', 'splatter')
  }

  export interface ScreenBloodSplashConfig {
    amount?: number;            // Количество брызг
    duration?: number;          // Длительность эффекта (исчезновение, стекание) в мс
    alpha?: {                   // Прозрачность брызг
        min: number;
        max: number;
    };
    scale?: {                   // Масштаб брызг
        min: number;
        max: number;
    };
    dripChance?: number;        // Вероятность (0-1), что брызг будет стекать
    dripDistance?: {            // Дистанция стекания
        min: number;
        max: number;
    };
    showVignette?: boolean;     // Показывать ли затемняющую рамку
    vignetteAlpha?: number;     // Максимальная прозрачность рамки
    vignetteDepth?: number;     // Глубина рамки
    splashesDepth?: number;     // Глубина брызг
  }

  export enum Texture {
    basic = 'blood_basic_texture',
    drops = 'blood_drops_texture',
    splatter = 'blood_splatter_texture'
  }
}