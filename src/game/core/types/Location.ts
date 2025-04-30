export namespace Location {
  export enum Id {
    FOREST = 'forest',
  }

  export interface Bounds {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }

  export abstract class BaseClass {
    public abstract preload: () => void;
    public abstract create: () => void;
    public abstract update: (time: number, delta?: number) => void;
    public abstract destroy: () => void;
    public abstract getBounds: () => Bounds;
  }
}