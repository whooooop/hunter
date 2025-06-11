export namespace Controls {
  export namespace Events {
    export namespace Move {
      export const Event = 'controls.move';
      export type Payload = {
        playerId: string;
        moveX: number;
        moveY: number;
      }
    }
    export namespace Fire {
      export const Event = 'controls.fire';
      export type Payload = {
        playerId: string;
        active: boolean;
      }
    }
    export namespace Reload {
      export const Event = 'controls.reload';
      export type Payload = {
        playerId: string;
      }
    }
    export namespace Jump {
      export const Event = 'controls.jump';
      export type Payload = {
        playerId: string;
      }
    }
    export namespace NextWeapon {
      export const Event = 'controls.nextWeapon';
      export type Payload = {
        playerId: string;
      }
    }
    export namespace PrevWeapon {
      export const Event = 'controls.prevWeapon';
      export type Payload = {
        playerId: string;
      }
    }
    export namespace Shop {
      export const Event = 'controls.shop';
      export type Payload = {
        playerId: string;
      }
    }

    export namespace KeyUp {
      export const Event = 'controls.keyUp';
      export type Payload = {
        playerId: string;
      }
    }
    export namespace KeyDown {
      export const Event = 'controls.keyDown';
      export type Payload = {
        playerId: string;
      }
    }
    export namespace KeyLeft {
      export const Event = 'controls.keyLeft';
      export type Payload = {
        playerId: string;
      }
    }
    export namespace KeyRight {
      export const Event = 'controls.keyRight';
      export type Payload = {
        playerId: string;
      }
    }
    export namespace NumberKey {
      export const Event = 'controls.numberKey';
      export type Payload = {
        playerId: string;
        number: number;
      }
    }
  }
}