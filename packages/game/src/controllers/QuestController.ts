import * as Phaser from 'phaser';
import { DEBUG } from '../config';
import { offEvent, onEvent } from '../GameEvents';
import { LevelId } from '../levels';
import { BankService } from '../services/BankService';
import { QuestService } from '../services/QuestService';
import { Bank, Game, Quest } from '../types';
import { createLogger, LogLevel } from '../utils/logger';

const logger = createLogger('QuestController', {
  minLevel: LogLevel.DEBUG,
  enabled: true,
});

export class QuestController {
  private scene: Phaser.Scene;
  private activeQuest: Quest.Config | null = null;
  private taskProgress: Map<string, number> = new Map();
  private completedTasks: Set<string> = new Set();
  private bankService: BankService;
  private questService: QuestService;
  private levelId: LevelId;

  constructor(scene: Phaser.Scene, levelId: LevelId, questId: string) {
    this.scene = scene;
    this.bankService = BankService.getInstance();
    this.questService = QuestService.getInstance();
    this.levelId = levelId;

    onEvent(scene, Game.Events.Stat.Local, this.handleGameEvent, this);

    this.init(levelId, questId);
  }

  private async init(levelId: LevelId, questId: string) {
    const result = await this.questService.getQuestWithTasksState(levelId, questId);
    if (result) {
      this.setActiveQuest(result.quest, result.tasks);
    }
  }

  /**
   * Устанавливает активный квест и сбрасывает прогресс.
   * @param questConfig Конфигурация квеста или null для сброса.
   */
  private setActiveQuest(questConfig: Quest.Config | null, tasksState: Record<string, Quest.TaskState>): void {
    if (DEBUG.QIEST) {
      logger.info(`Setting active quest: ${questConfig?.id ?? 'None'}`);
    }
    this.activeQuest = questConfig;
    this.taskProgress.clear();
    this.completedTasks.clear();

    if (this.activeQuest) {
      this.activeQuest.tasks.forEach(task => {
        this.taskProgress.set(task.id, 0);
        if (tasksState[task.id].done) {
          this.completedTasks.add(task.id);
        }
      });
    }
  }

  /**
   * Обрабатывает входящие игровые события для обновления прогресса квеста.
   * @param eventType
   * @param eventData
   */
  private handleGameEvent({ event, data }: Game.Events.Stat.Payload): void {
    if (DEBUG.QIEST) {
      logger.debug(`Handling game event: ${event}`, data);
    }

    if (!this.activeQuest) {
      return;
    }

    for (const task of this.activeQuest.tasks) {
      // Пропускаем уже завершенные задачи
      if (this.completedTasks.has(task.id)) {
        continue;
      }

      // Проверяем, соответствует ли событие типу задачи
      if (task.event === event) {
        // Проверяем условия задачи
        if (this.checkConditions(task.conditions, data)) {
          const currentProgress = this.taskProgress.get(task.id) ?? 0;
          let newProgress = currentProgress; // Инициализируем новым значением
          let targetValue = task.count; // Целевое значение по умолчанию

          // Логика подсчета прогресса
          if (task.count === -1 && task.value !== undefined && task.valueKey) {
            // Случай 1: Накопление значения по valueKey
            const eventValue = (data as any)[task.valueKey];
            if (typeof eventValue === 'number') {
              newProgress += eventValue;
              targetValue = task.value; // Цель - накопить task.value
              if (DEBUG.QIEST) {
                logger.debug(`Task '${task.id}' accumulating value by ${eventValue}. Progress: ${newProgress}/${targetValue}`);
              }
            } else {
              logger.warn(`Task '${task.id}' requires numeric value for key '${task.valueKey}', but got:`, eventValue);
              continue; // Пропускаем обновление, если значение некорректно
            }
          } else if (task.count > 0) {
            // Случай 2: Подсчет событий
            newProgress += 1;
            targetValue = task.count; // Цель - достичь task.count
            if (DEBUG.QIEST) {
              logger.debug(`Task '${task.id}' incrementing count. Progress: ${newProgress}/${targetValue}`);
            }
          } else {
            // Некорректная конфигурация задачи (например, count 0 или -1 без value/valueKey)
            logger.warn(`Task '${task.id}' has invalid configuration (count: ${task.count}, value: ${task.value}, valueKey: ${task.valueKey}). Skipping progress update.`);
            continue;
          }

          // Обновляем прогресс
          this.taskProgress.set(task.id, newProgress);

          // Проверяем завершение задачи
          if (targetValue > 0 && newProgress >= targetValue) {
            this.handleTaskCompletion(task);
          }
        }
      }
    }

    // Проверяем, завершен ли весь квест
    if (this.completedTasks.size === this.activeQuest.tasks.length) {
      this.handleQuestCompletion(this.activeQuest);
    }
  }

  /**
   * Проверяет, выполняются ли условия задачи для данного события.
   * @param conditions Массив условий задачи.
   * @param eventData Данные события.
   * @returns true, если все условия выполнены, иначе false.
   */
  private checkConditions(conditions: Quest.AnyTaskConfig['conditions'], eventData: any): boolean {
    if (!conditions || conditions.length === 0) {
      return true; // Нет условий - всегда выполняются
    }

    for (const condition of conditions) {
      const eventValue = eventData[condition.key];

      // Если в данных события нет нужного ключа, условие не выполнено
      if (eventValue === undefined) {
        logger.warn(`Condition check failed: Key '${condition.key}' not found in event data`, eventData);
        return false;
      }

      // Проверяем в зависимости от типа условия
      // Мы можем использовать type guard или проверку наличия полей для определения типа condition
      if ('operator' in condition) {
        const numericCondition = condition;
        const value = numericCondition.value;
        switch (numericCondition.operator) {
          case '=': if (!(eventValue === value)) return false; break;
          case '>': if (!(eventValue > value)) return false; break;
          case '<': if (!(eventValue < value)) return false; break;
          case '>=': if (!(eventValue >= value)) return false; break;
          case '<=': if (!(eventValue <= value)) return false; break;
          default:
            logger.warn(`Unknown operator '${numericCondition.operator}' for condition key '${condition.key}'`);
            return false; // Неизвестный оператор
        }
      } else { // Это условие с простым равенством (WeaponName, EnemyType, Body, OneShot)
        if (eventValue !== condition.value) {
          logger.debug(`Condition check failed: Key '${condition.key}' value mismatch. Event: ${eventValue}, Expected: ${condition.value}`);
          return false;
        }
      }
    }
    // Если все условия прошли проверку
    if (DEBUG.QIEST) {
      logger.debug('All conditions met for event', eventData);
    }
    return true;
  }

  /**
   * Обрабатывает завершение задачи.
   * @param task Завершенная задача.
   */
  private handleTaskCompletion(task: Quest.AnyTaskConfig): void {
    if (this.completedTasks.has(task.id)) return;

    this.completedTasks.add(task.id);
    if (DEBUG.QIEST) {
      logger.info(`Task '${task.id}' completed!`);
    }


    if (task.reward.currency === Bank.Currency.Star) {
      this.bankService.increasePlayerBalance(Bank.Currency.Star, task.reward.amount);
    }

    this.questService.setTaskCompleted(task.id);
  }

  /**
   * Обрабатывает завершение всего квеста.
   * @param quest Завершенный квест.
   */
  private handleQuestCompletion(quest: Quest.Config): void {
    if (DEBUG.QIEST) {
      logger.info(`Quest '${quest.id}' completed! All tasks finished.`);
    }
    this.questService.setQuestCompleted(this.levelId, quest.id);
  }

  destroy(): void {
    offEvent(this.scene, Game.Events.Stat.Local, this.handleGameEvent, this);
  }
}