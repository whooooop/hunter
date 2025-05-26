
export enum ScoreEvents {
  IncreaseScoreEvent = 'IncreaseScoreEvent',
  DecreaseScoreEvent = 'DecreaseScoreEvent',
  UpdateScoreEvent = 'UpdateScoreEvent',
}

export interface IncreaseScoreEventPayload {
  playerId: string;
  score: number;
}

export interface DecreaseScoreEventPayload {
  playerId: string;
  score: number;
}

export interface UpdateScoreEventPayload {
  playerId: string;
  score: number;
}