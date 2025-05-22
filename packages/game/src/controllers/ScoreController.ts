import { offEvent, onEvent, emitEvent } from "../GameEvents";
import { IncreaseScoreEventPayload, DecreaseScoreEventPayload, ScoreEvents, Game } from '../types';

export class ScoreController {
  private scene: Phaser.Scene;
  private scere: Map<string, number> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // onEvent(scene, Game.Events.State.Remote, this.handleGameState, this);
    onEvent(scene, ScoreEvents.IncreaseScoreEvent, this.handleIncreaseScore, this);
    onEvent(scene, ScoreEvents.DecreaseScoreEvent, this.handleDecreaseScore, this);
  }

  // private handleGameState(payload: Game.Events.State.Payload): void {
  //   payload.playersState.forEach((player) => {
  //     this.scere.set(player.id, player.score);
  //   });
  // }

  private handleIncreaseScore(payload: IncreaseScoreEventPayload): void {
    if (!this.scere.has(payload.playerId)) {
      this.scere.set(payload.playerId, 0);
    } 
    const currentScore = this.scere.get(payload.playerId)!;
    const score = currentScore + payload.score;

    this.scere.set(payload.playerId, score);

    emitEvent(this.scene, ScoreEvents.UpdateScoreEvent, { playerId: payload.playerId, score });
    emitEvent(this.scene, Game.Events.Stat.Local, {
      event: Game.Events.Stat.EarnEvent.Event,
      data: {
        score: payload.score,
      },
    });
  }

  private handleDecreaseScore(payload: DecreaseScoreEventPayload): void {
    if (!this.scere.has(payload.playerId)) {
      this.scere.set(payload.playerId, 0);
    } 
    const currentScore = this.scere.get(payload.playerId)!;
    const score = Math.max(currentScore - payload.score, 0);

    this.scere.set(payload.playerId, score);

    emitEvent(this.scene, ScoreEvents.UpdateScoreEvent, { playerId: payload.playerId, score });
    emitEvent(this.scene, Game.Events.Stat.Local, {
      event: Game.Events.Stat.SpendEvent.Event,
      data: {
        score: payload.score,
      },
    });
  }

  public destroy(): void {
    // offEvent(this.scene, Game.Events.State.Remote, this.handleGameState, this);
    offEvent(this.scene, ScoreEvents.IncreaseScoreEvent, this.handleIncreaseScore, this);
    offEvent(this.scene, ScoreEvents.DecreaseScoreEvent, this.handleDecreaseScore, this);
  }
} 