export abstract class ControlsViewBase extends Phaser.GameObjects.Container {
  abstract show(): Promise<void>;
  abstract hide(): Promise<void>;
}