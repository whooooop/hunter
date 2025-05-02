import { EventGameState } from "../proto/generated/game";

export namespace Game {
  export namespace Events {
    export namespace State {
      export const Remote = 'GameStateRemoteEvent';
      export type Payload = EventGameState;
    }

    export namespace Pause {
      export const Local = 'GamePauseLocalEvent';
      export type Payload = {};
    }

    export namespace Replay {
      export const Local = 'GameReplayLocalEvent';
      export type Payload = {};
    }

    export namespace Exit {
      export const Local = 'GameExitLocalEvent';
      export type Payload = {};
    }

    export namespace Resume {
      export const Local = 'GameResumeLocalEvent';
      export type Payload = {};
    }
  }
}