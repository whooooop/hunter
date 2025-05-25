import { SyncCollection } from "@hunter/multiplayer/dist/Collection";
import { StorageSpace } from "@hunter/multiplayer/dist/StorageSpace";
import { PlayerScoreState } from "@hunter/storage-proto/dist/storage";
import { emitEvent, offEvent, onEvent } from "../GameEvents";
import { playerScoreStateCollection } from "../storage/collections/playerScoreState.collection";
import { DecreaseScoreEventPayload, Game, IncreaseScoreEventPayload, ScoreEvents } from '../types';

export class ScoreController {
  private scores: SyncCollection<PlayerScoreState>

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly storage: StorageSpace
  ) {
    this.scores = this.storage.getCollection<PlayerScoreState>(playerScoreStateCollection)!;

    onEvent(scene, ScoreEvents.IncreaseScoreEvent, this.handleIncreaseScore, this);
    onEvent(scene, ScoreEvents.DecreaseScoreEvent, this.handleDecreaseScore, this);
  }

  private handleIncreaseScore(payload: IncreaseScoreEventPayload): void {
    if (!this.scores.has(payload.playerId)) {
      this.scores.addItem(payload.playerId, { value: 0 });
    }
    const currentScore = this.scores.getItem(payload.playerId)!;
    currentScore.value += payload.score;

    emitEvent(this.scene, Game.Events.Stat.Local, {
      event: Game.Events.Stat.EarnEvent.Event,
      data: {
        score: payload.score,
      },
    });
  }

  private handleDecreaseScore(payload: DecreaseScoreEventPayload): void {
    if (!this.scores.has(payload.playerId)) {
      this.scores.addItem(payload.playerId, { value: 0 });
    }
    const currentScore = this.scores.getItem(payload.playerId)!;
    currentScore.value = Math.max(currentScore.value - payload.score, 0);

    emitEvent(this.scene, Game.Events.Stat.Local, {
      event: Game.Events.Stat.SpendEvent.Event,
      data: {
        score: payload.score,
      },
    });
  }

  public destroy(): void {
    offEvent(this.scene, ScoreEvents.IncreaseScoreEvent, this.handleIncreaseScore, this);
    offEvent(this.scene, ScoreEvents.DecreaseScoreEvent, this.handleDecreaseScore, this);
  }
} 