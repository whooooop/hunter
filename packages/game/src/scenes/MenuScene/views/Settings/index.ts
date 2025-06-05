import { ClickSound, preloadClickSound } from "../../../../audio/click";
import { preloadWolfSound, WolfSound } from "../../../../audio/wolf";
import { DISPLAY, FONT_FAMILY } from "../../../../config";
import { emitEvent } from "../../../../GameEvents";
import { preloadAudio } from "../../../../preload";
import { AudioService } from "../../../../services/AudioService";
import { UiBackButton } from "../../../../ui/BackButton";
import { UiContainer } from "../../../../ui/Container";
import { UiSlider } from "../../../../ui/Slider";
import { GlockShootAudio } from "../../../../weapons/Glock";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { AudioAmbienceText, AudioEffectsText, AudioGeneralText, AudioInterfaceText, AudioMusicText, AudioSettingsText, SettingsText } from "./translates";

export class SettingsView implements MenuSceneTypes.View {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  private backButton: UiBackButton;

  static preload(scene: Phaser.Scene): void {
    UiContainer.preload(scene);
    preloadClickSound(scene);
    preloadAudio(scene, GlockShootAudio.key, GlockShootAudio.url);
    preloadWolfSound(scene);
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.backButton = new UiBackButton(this.scene);
    this.container.add(this.backButton);

    const uiContainer = new UiContainer(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2, SettingsText.translate);
    uiContainer.setScale(0.9);
    this.container.add(uiContainer);

    const audioSettings = this.createAudioSettings();
    uiContainer.add(audioSettings);

    // this.scene.add.existing(slider.element);
    // audioWeaponVolume: 0.5,
    // audioEffectsVolume: 1,
    // audioMusicVolume: 0.5,

    this.backButton.on('pointerdown', () => {
      emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey: MenuSceneTypes.ViewKeys.HOME });
    });
  }

  createAudioSettings(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, -160);
    const textOffsetX = -140;
    const sliderOffsetX = 50;
    const settings = AudioService.getSettings();

    container.add(
      this.scene.add.text(0, 0, AudioSettingsText.translate.toUpperCase(), { fontSize: 24, fontFamily: FONT_FAMILY.BOLD, color: '#ffffff' }).setOrigin(0.5)
    );

    container.add(
      this.scene.add.text(textOffsetX, 70, AudioGeneralText.translate + ':', { fontSize: 24, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff' }).setOrigin(1, 0.5)
    );
    const generalSlider = new UiSlider(this.scene, sliderOffsetX, 70, { width: 340 });
    generalSlider.element.setValue(settings.globalVolume);
    generalSlider.element.on('inputend', () => {
      AudioService.setSettingsValue('globalVolume', generalSlider.element.getValue());
    });
    container.add(generalSlider.element);

    container.add(
      this.scene.add.text(textOffsetX, 140, AudioMusicText.translate + ':', { fontSize: 24, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff' }).setOrigin(1, 0.5)
    );
    const musicSlider = new UiSlider(this.scene, sliderOffsetX, 140, { width: 340 });
    musicSlider.element.setValue(settings.musicVolume);
    musicSlider.element.on('inputend', () => {
      AudioService.setSettingsValue('musicVolume', musicSlider.element.getValue());
    });
    container.add(musicSlider.element);

    container.add(
      this.scene.add.text(textOffsetX, 210, AudioEffectsText.translate + ':', { fontSize: 24, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff' }).setOrigin(1, 0.5)
    );
    const effectsSlider = new UiSlider(this.scene, sliderOffsetX, 210, { width: 340 });
    effectsSlider.element.setValue(settings.effectVolume);
    effectsSlider.element.on('inputend', () => {
      AudioService.setSettingsValue('effectVolume', effectsSlider.element.getValue());
      AudioService.playAudio(this.scene, GlockShootAudio);
    });
    container.add(effectsSlider.element);

    container.add(
      this.scene.add.text(textOffsetX, 280, AudioAmbienceText.translate + ':', { fontSize: 24, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff' }).setOrigin(1, 0.5)
    );
    const ambienceSlider = new UiSlider(this.scene, sliderOffsetX, 280, { width: 340 });
    ambienceSlider.element.setValue(settings.ambienceVolume);
    ambienceSlider.element.on('inputend', () => {
      AudioService.setSettingsValue('ambienceVolume', ambienceSlider.element.getValue());
      AudioService.playAudio(this.scene, WolfSound);
    });
    container.add(ambienceSlider.element);

    container.add(
      this.scene.add.text(textOffsetX, 350, AudioInterfaceText.translate + ':', { fontSize: 24, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff' }).setOrigin(1, 0.5)
    );
    const interfaceSlider = new UiSlider(this.scene, sliderOffsetX, 350, { width: 340 });
    interfaceSlider.element.setValue(settings.interfaceVolume);
    interfaceSlider.element.on('inputend', () => {
      AudioService.setSettingsValue('interfaceVolume', interfaceSlider.element.getValue());
      AudioService.playAudio(this.scene, ClickSound);
    });
    container.add(interfaceSlider.element);

    return container;
  }

  update(time: number, delta: number): void { }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  enter(): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  leave(): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}