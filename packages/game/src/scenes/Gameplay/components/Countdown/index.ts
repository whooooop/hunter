import { FONT_FAMILY } from "../../../../config";

export class Countdown extends Phaser.GameObjects.Container {
  private countdownText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  start(duration: number, delay: number): Promise<void> {
    let count = Math.floor(duration / 1000);

    return new Promise((resolve) => {
      this.scene.time.delayedCall(delay, () => {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        this.countdownText = this.scene.add.text(centerX, centerY, count.toString(), {
          fontFamily: FONT_FAMILY.BOLD,
          fontSize: '200px',
          color: '#ffffff'
        }).setOrigin(0.5).setDepth(800);

        const timer = this.scene.time.addEvent({
          delay: 1000,
          callback: () => {
            count--;
            if (count > 0) {
              this.countdownText?.setText(count.toString());
              this.countdownText?.setScale(0.5);
              this.scene.tweens.add({
                targets: this.countdownText,
                scale: 1,
                duration: 300,
                ease: 'Back.easeOut'
              });
            } else {
              this.scene.tweens.add({
                targets: this.countdownText,
                scale: 0,
                alpha: 0,
                duration: 100,
                onComplete: () => {
                  this.countdownText?.destroy();
                  resolve();
                }
              });
            }
          },
          repeat: count - 1
        });

        this.countdownText?.setScale(0.5);
        this.scene.tweens.add({
          targets: this.countdownText,
          scale: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });
      });
    });
  }
}