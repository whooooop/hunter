import { MotionController } from "../controllers/MotionController";
import { WeaponController } from "../controllers/WeaponController";

export class PlayerEntity {
  // protected motionController: MotionController;
  protected weaponController: WeaponController;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.weaponController = new WeaponController(scene);
    // this.motionController = new MotionController(scene, { x, y });
  }

  fire() {
    const weapon = this.weaponController.getCurrentWeapon();
    if (!weapon) {
      return;
    }

    // const recoilForce = weapon.fire();
    // this.applyForce(
    //   recoilForce.recoilVectorX,
    //   recoilForce.recoilVectorY,
    //   recoilForce.boostedForce,
    //   recoilForce.strength,
    //   recoilForce.decayRate
    // );
  }

  update(time: number, delta: number) {
    this.updateWeapon(time, delta);
  }

  private updateWeapon(time: number, delta: number) {
    const weapon = this.weaponController.getCurrentWeapon();
    if (!weapon) {
      return;
    }
    // weapon.setPosition(this.x, this.y);
    weapon.update(time, delta);
  }
}