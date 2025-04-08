/**
 * Уровни логирования
 */
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}

/**
 * Настройки логгера
 */
export interface LoggerOptions {
  /** Минимальный уровень для логирования */
  minLevel: LogLevel;
  /** Разрешено ли логирование */
  enabled: boolean;
}

/**
 * Цвета для разных уровней логов
 */
const LogColors = {
  [LogLevel.DEBUG]: '\x1b[36m', // Голубой
  [LogLevel.INFO]: '\x1b[32m',  // Зеленый
  [LogLevel.WARN]: '\x1b[33m',  // Желтый
  [LogLevel.ERROR]: '\x1b[31m', // Красный
  [LogLevel.NONE]: '',          // Без цвета
  reset: '\x1b[0m',
};

/**
 * Названия уровней логов
 */
const LogLevelNames = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO ',
  [LogLevel.WARN]: 'WARN ',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.NONE]: 'NONE ',
};

/**
 * Класс логгера с поддержкой уровней, цветов и контекста
 */
export class Logger {
  private options: LoggerOptions;
  private context: string;

  /**
   * Конструктор логгера
   * @param context Название контекста (модуля, класса и т.д.)
   * @param options Настройки для этого логгера
   */
  constructor(context: string, options?: Partial<LoggerOptions>) {
    this.context = context;
    this.options = {
      minLevel: LogLevel.INFO,
      enabled: true,
      ...options
    };
  }

  /**
   * Включает логирование
   */
  enable(): void {
    this.options.enabled = true;
  }

  /**
   * Отключает логирование
   */
  disable(): void {
    this.options.enabled = false;
  }

  /**
   * Устанавливает минимальный уровень для логирования
   */
  setMinLevel(level: LogLevel): void {
    this.options.minLevel = level;
  }

  /**
   * Проверяет, можно ли логировать сообщение указанного уровня
   */
  private canLog(level: LogLevel): boolean {
    return this.options.enabled && level <= this.options.minLevel;
  }

  /**
   * Форматирует сообщение для вывода
   */
  private formatMessage(level: LogLevel, message: string): string {
    const now = new Date();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    const timestamp = `${minutes}:${seconds}.${milliseconds}`;
    
    const levelName = LogLevelNames[level];
    const color = LogColors[level];
    
    return `${color}[${timestamp}] [${levelName}] [${this.context}]: ${message}${LogColors.reset}`;
  }

  /**
   * Логирует отладочное сообщение
   */
  debug(message: string, ...args: any[]): void {
    if (this.canLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message), ...args);
    }
  }

  /**
   * Логирует информационное сообщение
   */
  info(message: string, ...args: any[]): void {
    if (this.canLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message), ...args);
    }
  }

  /**
   * Логирует предупреждение
   */
  warn(message: string, ...args: any[]): void {
    if (this.canLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message), ...args);
    }
  }

  /**
   * Логирует ошибку
   */
  error(message: string, ...args: any[]): void {
    if (this.canLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message), ...args);
    }
  }
}

/**
 * Глобальный логгер для использования во всем проекте
 */
export const logger = new Logger('Global');

/**
 * Создает новый логгер с указанным контекстом
 */
export function createLogger(context: string, options?: Partial<LoggerOptions>): Logger {
  return new Logger(context, options);
} 