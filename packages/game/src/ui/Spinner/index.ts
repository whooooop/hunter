export class UiSpinner extends Phaser.GameObjects.Container {
  private dots: Phaser.GameObjects.Graphics[] = [];
  private readonly DOT_COUNT = 8;
  private readonly RADIUS = 20;
  private readonly DOT_SIZE = 4;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Создаем точки
    for (let i = 0; i < this.DOT_COUNT; i++) {
      const dot = scene.add.graphics();
      const angle = (i / this.DOT_COUNT) * Math.PI * 2;
      const alpha = 1 - (i / this.DOT_COUNT);

      dot.fillStyle(0xffffff, alpha);
      dot.fillCircle(
        Math.cos(angle) * this.RADIUS,
        Math.sin(angle) * this.RADIUS,
        this.DOT_SIZE
      );
      this.dots.push(dot);
      this.add(dot);
    }

    // Добавляем анимацию
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 1000,
      repeat: -1,
      ease: 'Linear'
    });

    scene.add.existing(this);
  }

  public destroy() {
    this.dots.forEach(dot => dot.destroy());
    super.destroy();
  }
}
