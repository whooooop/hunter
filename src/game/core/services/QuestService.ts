import { GameStorage } from "../GameStorage";
import { PlayerService } from "./PlayerService";
import { getLevel, LevelId } from '../../levels';
import { Quest } from "../types";

export class QuestService {
  private static instance: QuestService;
  private storage: GameStorage;
  private playerService: PlayerService;
  
  static getInstance(): QuestService {
    if (!QuestService.instance) {
      QuestService.instance = new QuestService();
    }
    return QuestService.instance;
  }

  private constructor() {
    this.storage = new GameStorage();
    this.playerService = PlayerService.getInstance();
  }

  private getLevelQuestStateKey(playerId: string, levelId: LevelId): string {
    return `quests_${playerId}_${levelId}`;
  }

  private getTaskStateKey(playerId: string, taskId: string): string {
    return `task_${playerId}_${taskId}`;
  }

  private async getPlayerState(levelId: LevelId): Promise<Quest.StorageState> {
    const playerId = this.playerService.getCurrentPlayerId();
    const key = this.getLevelQuestStateKey(playerId, levelId);
    const state = await this.storage.get<Quest.StorageState>(key);
    if (!state) {
      return {
        lastCompletedQuestId: null,
      };
    }
    return state;
  }

  private async setPlayerState(levelId: LevelId, state: Quest.StorageState): Promise<void> {
    const playerId = this.playerService.getCurrentPlayerId();
    const key = this.getLevelQuestStateKey(playerId, levelId);
    await this.storage.set(key, state);
  }
    
  async getCurrentQuest(levelId: LevelId): Promise<Quest.Config | null> {
    const playerState = await this.getPlayerState(levelId);
    const quest = await this.findQuest(levelId, playerState.lastCompletedQuestId);
    return quest;
  }

  private async getQuest(levelId: LevelId, questId: string): Promise<Quest.Config | null> {
    const levelConfig = getLevel(levelId);
    if (!levelConfig?.quests || levelConfig.quests.length === 0) return null;
    return levelConfig.quests.find(quest => quest.id === questId) || null;
  }

  private async findQuest(levelId: LevelId, lastCompletedQuestId: string | null): Promise<Quest.Config | null> {
    const levelConfig = getLevel(levelId);
    if (!levelConfig?.quests || levelConfig.quests.length === 0) return null;

    const questIndex = levelConfig.quests.findIndex(quest => quest.id === lastCompletedQuestId);
    if (questIndex === -1) return levelConfig.quests[0];
    const nextQuestIndex = questIndex + 1;
    if (nextQuestIndex >= levelConfig.quests.length) return null;
    return levelConfig.quests[nextQuestIndex];
  }

  async getQuestWithTasksState(levelId: LevelId, questId: string): Promise<{ quest: Quest.Config, tasks: Record<string, Quest.TaskState> } | null> {
    const quest = await this.getQuest(levelId, questId);
    if (!quest) return null;
    const taskIds = quest.tasks.map(task => task.id);
    const tasks = await this.getTasksState(taskIds);
    return { quest, tasks };
  }

  async getTasksState(taskIds: string[]): Promise<Record<string, Quest.TaskState>> {
    const result: Record<string, Quest.TaskState> = {};

    for (const taskId of taskIds) {
      const taskState = await this.getTaskState(taskId);
      result[taskId] = taskState;
    }
    return result;
  }

  private async setTaskState(taskId: string, state: Quest.TaskState): Promise<void> {
    const playerId = this.playerService.getCurrentPlayerId();
    const taskStateKey = this.getTaskStateKey(playerId, taskId);
    await this.storage.set(taskStateKey, state);
  }

  private async getTaskState(taskId: string): Promise<Quest.TaskState> {
    const playerId = this.playerService.getCurrentPlayerId();
    const taskStateKey = this.getTaskStateKey(playerId, taskId);
    const state = await this.storage.get<Quest.TaskState>(taskStateKey);
    if (!state) {
      return { done: false };
    } else {
      return state;
    }
  }

  async setQuestCompleted(levelId: LevelId, questId: string): Promise<void> {
    const state = await this.getPlayerState(levelId);
    state.lastCompletedQuestId = questId;
    await this.setPlayerState(levelId, state);
  }

  async setTaskCompleted(taskId: string): Promise<void> {
    await this.setTaskState(taskId, { done: true });
  }
}

