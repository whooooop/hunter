export namespace MenuSceneTypes {
  export enum ViewKeys {
    HOME = 'HomeView',
    SELECT_LEVEL = 'SelectLevelView',
    MULTIPLAYER = 'MultiplayerView',
    SETTINGS = 'SettingsView',
    SHOP = 'ShopView',
  }

  export namespace Events {
    export namespace Play {
      export const Name = 'MenuSceneEventPlay';
      export interface Payload {
        levelId: string;
      }
    }

    export namespace GoToView {
      export const Name = 'MenuSceneEventGoToView';
      export interface Payload {
        viewKey: ViewKeys
      }
    }

  }

  export abstract class View {
    public abstract update(time: number, delta: number): void;
    public abstract getContainer(): Phaser.GameObjects.Container;
    public abstract enter(): Promise<void>;
    public abstract leave(): Promise<void>;
    public abstract destroy(): void;
  }
}