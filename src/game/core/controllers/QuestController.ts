import * as Phaser from 'phaser';
import { Quest } from '../types/QuestsTypes'; // Предполагаемый путь
import { createLogger } from '../../../utils/logger';
import { offEvent, onEvent } from '../Events';
import { Game } from '../types';

const logger = createLogger('QuestController');

export class QuestController {
  private scene: Phaser.Scene;
  private activeQuest: Quest.Config | null = null;
  private taskProgress: Map<string, number> = new Map();
  private completedTasks: Set<string> = new Set();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    onEvent(scene, Game.Events.Stat.Local, this.handleGameEvent, this);
  }

  /**
   * Устанавливает активный квест и сбрасывает прогресс.
   * @param questConfig Конфигурация квеста или null для сброса.
   */
  public setActiveQuest(questConfig: Quest.Config | null): void {
    logger.info(`Setting active quest: ${questConfig?.id ?? 'None'}`);
    this.activeQuest = questConfig;
    this.taskProgress.clear();
    this.completedTasks.clear();

    if (this.activeQuest) {
      this.activeQuest.tasks.forEach(task => {
        this.taskProgress.set(task.id, 0);
      });
    }
    // TODO: Отписаться от старых слушателей событий, если они были?
    // TODO: Подписаться на нужные события для нового квеста?
  }

  /**
   * Обрабатывает входящие игровые события для обновления прогресса квеста.
   * @param eventType Тип игрового события (например, 'enemyKilled', 'playerDamaged').
   * @param eventData Данные события (например, { enemyType: 'rabbit', bodyPart: 'head' }).
   */
  private handleGameEvent({ event, data }: Game.Events.Stat.Payload): void {
    if (!this.activeQuest) {
      return; // Нет активного квеста
    }

    logger.debug(`Handling game event: ${event}`, data);

    for (const task of this.activeQuest.tasks) {
      // Пропускаем уже завершенные задачи
      if (this.completedTasks.has(task.id)) {
        continue;
      }

      // Проверяем, соответствует ли событие типу задачи
      if (task.event === event) {
        // Проверяем условия задачи
        if (this.checkConditions(task.conditions, data)) {
          // Увеличиваем прогресс
          const currentProgress = this.taskProgress.get(task.id) ?? 0;
          const newProgress = currentProgress + 1; // Пока просто +1, можно будет брать из eventData
          this.taskProgress.set(task.id, newProgress);
          logger.debug(`Task '${task.id}' progress: ${newProgress}/${task.count}`);

          // Проверяем завершение задачи
          if (newProgress >= task.count) {
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
    logger.debug('All conditions met for event', eventData);
    return true;
  }

  /**
   * Обрабатывает завершение задачи.
   * @param task Завершенная задача.
   */
  private handleTaskCompletion(task: Quest.AnyTaskConfig): void {
    if (this.completedTasks.has(task.id)) return; // Уже обработано

    this.completedTasks.add(task.id);
    logger.info(`Task '${task.id}' completed!`);

    // TODO: Выдать награду за задачу?
    // emitEvent(this.eventEmitter, Quest.Events.TaskCompleted, { taskId: task.id, reward: task.reward });
  }

  /**
   * Обрабатывает завершение всего квеста.
   * @param quest Завершенный квест.
   */
  private handleQuestCompletion(quest: Quest.Config): void {
    logger.info(`Quest '${quest.id}' completed! All tasks finished.`);
    // TODO: Выдать финальную награду?
    // TODO: Возможно, автоматически сбросить квест?
    // this.setActiveQuest(null);
    // emitEvent(this.eventEmitter, Quest.Events.QuestCompleted, { questId: quest.id });
  }

  // TODO: Добавить метод для получения текущего прогресса
  // public getQuestProgress(): QuestProgress | null { ... }

  // TODO: Добавить метод для подписки на события квеста (завершение задачи/квеста)
  destroy(): void {
    logger.info('QuestController destroyed');
    offEvent(this.scene, Game.Events.Stat.Local, this.handleGameEvent, this);
  }
}