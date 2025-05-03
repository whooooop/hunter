import { offEvent, onEvent } from "../Events";
import { GameStorage } from "../GameStorage";
import { Star } from "../types";

export class StarController {
  private scene: Phaser.Scene;
  private gameStorage = new GameStorage();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    onEvent(this.scene, Star.Events.Increase.Local, this.increaseHandler);
    onEvent(this.scene, Star.Events.Decrease.Local, this.decreaseHandler);
  }

  private increaseHandler(payload: Star.Events.Increase.Payload) {
    // this.gameStorage.increase(payload.value);
  }

  private decreaseHandler(payload: Star.Events.Decrease.Payload) {
    // this.gameStorage.decrease(payload.value);
  }

  public destroy(): void {
    offEvent(this.scene, Star.Events.Increase.Local, this.increaseHandler);
    offEvent(this.scene, Star.Events.Decrease.Local, this.decreaseHandler);
  }
}
