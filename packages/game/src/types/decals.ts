export namespace Decals {
  export namespace Events {
    export const Local = 'DecalLocalEvent';
    export interface Payload {
      type: 'particle' | 'blood' | 'shellCasing' | 'body';
      x: number;
      y: number;
      object: Phaser.GameObjects.Sprite;
    }
  }
}
