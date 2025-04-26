export type ImageTexture = {
  key: string;
  url?: string;
  generate?: (scene: Phaser.Scene, key: string) => void;
  scale: number;
}
