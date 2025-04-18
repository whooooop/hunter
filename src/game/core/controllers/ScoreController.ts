import { onEvent } from "../Events";
import { IncreaseScoreEventPayload } from "../types/scoreTypes";
import { ScoreEvents } from "../types/scoreTypes";
import { emitEvent } from "../Events";

export class ScoreController {
  private scene: Phaser.Scene;
  private scere: Map<string, number> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    onEvent(scene, ScoreEvents.IncreaseScoreEvent, (payload: IncreaseScoreEventPayload) => this.handleIncreaseScore(payload));
  }

  private handleIncreaseScore(payload: IncreaseScoreEventPayload): void {
    if (!this.scere.has(payload.playerId)) {
      this.scere.set(payload.playerId, 0);
    } 
    const currentScore = this.scere.get(payload.playerId)!;
    const score = currentScore + payload.score;

    this.scere.set(payload.playerId, score);

    emitEvent(this.scene, ScoreEvents.UpdateScoreEvent, { playerId: payload.playerId, score });
  }

} 