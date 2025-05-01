import { HomeView } from "./views/Home";
import { SceneKeys } from "../index";
import { LoadingView } from "../../views/loading/LoadingView";
import { BackgroundView } from "../../views/background/BackgroundView";
import { MenuSceneTypes } from "./MenuSceneTypes";
import { MultipleerView } from "./views/Multipleer";
import { offEvent, onEvent } from "../../core/Events";
import { SettingsView } from "./views/Settings";
import { ShopView } from "./views/Shop";
import { SelectLevelView } from "./views/SelectLevel";

export class MenuScene extends Phaser.Scene {
  private backgroundView!: BackgroundView;
  private viewContainer!: Phaser.GameObjects.Container;
  private currentView!: MenuSceneTypes.View;

  private views: Map<MenuSceneTypes.ViewKeys, new (scene: Phaser.Scene) => MenuSceneTypes.View> = new Map([
    [MenuSceneTypes.ViewKeys.HOME, HomeView],
    [MenuSceneTypes.ViewKeys.SELECT_LEVEL, SelectLevelView],
    [MenuSceneTypes.ViewKeys.MULTIPLAYER, MultipleerView],
    [MenuSceneTypes.ViewKeys.SETTINGS, SettingsView],
    [MenuSceneTypes.ViewKeys.SHOP, ShopView],
  ] as [MenuSceneTypes.ViewKeys, new (scene: Phaser.Scene) => MenuSceneTypes.View][]);

  constructor() {
    super({ key: SceneKeys.MENU });
  }

  init() {
    new LoadingView(this);
  }

  preload(): void {
    HomeView.preload(this);
  }

  create(): void {
    this.viewContainer = this.add.container(0, 0).setDepth(10);
    this.backgroundView = new BackgroundView(this, this.viewContainer);
    this.renderView(MenuSceneTypes.ViewKeys.HOME);

    onEvent(this, MenuSceneTypes.Events.Play.Name, this.playHandler, this);
    onEvent(this, MenuSceneTypes.Events.GoToView.Name, this.goToViewHandler, this);
  }

  playHandler(payload: MenuSceneTypes.Events.Play.Payload): void {
    console.log('playHandler', payload);
  }

  goToViewHandler(payload: MenuSceneTypes.Events.GoToView.Payload): void {
    this.renderView(payload.viewKey);
  }
  

  async renderView(viewName: MenuSceneTypes.ViewKeys): Promise<void>  {
    const View = this.views.get(viewName);
    console.log('renderView', viewName, View);
    if (View) {
      const view = new View(this);
      const leaveView = this.currentView;

      if (leaveView) {
        await leaveView.leave();
        this.viewContainer.remove(leaveView.getContainer());
        leaveView?.destroy();
      }

      this.viewContainer.add(view.getContainer());
      this.currentView = view;
      await view.enter();
    }
  }

  update(time: number, delta: number): void {
    this.backgroundView.update(time, delta);
    if (this.currentView) {
      this.currentView.update(time, delta);
    }
  }

  destroy(): void {
    offEvent(this, MenuSceneTypes.Events.Play.Name, this.playHandler, this);
    offEvent(this, MenuSceneTypes.Events.GoToView.Name, this.goToViewHandler, this);
  }
}