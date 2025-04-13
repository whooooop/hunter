export class ScoreController {
  private score: number = 0;

  constructor() {}

  public addScore(score: number): void {
    this.score += score;
  }

  public getScore(): number {
    return this.score;
  } 
} 