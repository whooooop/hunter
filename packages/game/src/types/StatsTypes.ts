export namespace Stats {
  export namespace Storage {
    export interface State {
      gameplays: number;
    }
    export interface LevelStats {
      bestScore: number;
      gameplays: number;
    }
  }
}