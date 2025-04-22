import { EventGameState } from "../proto/generated/game";

export namespace Game {
  export namespace Events {
    export namespace State {
      export const Remote = 'GameStateRemoteEvent';
      export type Payload = EventGameState;
    }
  }
}