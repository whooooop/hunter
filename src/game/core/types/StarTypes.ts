export namespace Star {
  export namespace Events {
    export namespace Increase {
      export const Local = 'StarIncreaseLocalEvent';
      export interface Payload {
        value: number;
      }
    }
    export namespace Decrease {
      export const Local = 'StarDecreaseLocalEvent';
      export interface Payload {
        value: number;
      }
    }
  }
}
