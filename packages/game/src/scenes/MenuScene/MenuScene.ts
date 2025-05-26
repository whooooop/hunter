import { HomeView } from "./views/Home";
import { SceneKeys } from "../index";
import { LoadingView } from "../../views/loading/LoadingView";
import { BackgroundView } from "../../views/background/BackgroundView";
import { MenuSceneTypes } from "./MenuSceneTypes";
import { MultipleerView } from "./views/Multipleer";
import { offEvent, onEvent } from "../../GameEvents";
import { SettingsView } from "./views/Settings";
import { ShopView } from "./views/Shop";
import { SelectLevelView } from "./views/SelectLevel";

export class MenuScene extends Phaser.Scene {
  private backgroundView!: BackgroundView;
  private currentView!: MenuSceneTypes.View;

  private container!: Phaser.GameObjects.Container;
  private initialViewKey!: MenuSceneTypes.ViewKeys;

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

  init({ view }: { view: MenuSceneTypes.ViewKeys }) {
    this.initialViewKey = view;
    new LoadingView(this);
  }

  preload(): void {
    HomeView.preload(this);
    SelectLevelView.preload(this);
  }

  create(): void {
    onEvent(this, MenuSceneTypes.Events.Play.Name, this.playHandler, this);
    onEvent(this, MenuSceneTypes.Events.GoToView.Name, this.goToViewHandler, this);

    this.container = this.add.container(0, 0);
    this.backgroundView = new BackgroundView(this);
    this.container.add(this.backgroundView.getContainer());

    this.renderView(this.initialViewKey);
  }

  playHandler(payload: MenuSceneTypes.Events.Play.Payload): void {
    this.scene.start(SceneKeys.GAMEPLAY, { levelId: payload.levelId });
    this.clear();
  }

  goToViewHandler(payload: MenuSceneTypes.Events.GoToView.Payload): void {
    this.renderView(payload.viewKey);
  }
  
  async renderView(viewName: MenuSceneTypes.ViewKeys): Promise<void>  {
    const View = this.views.get(viewName);
    if (View) {
      const leaveView = this.currentView;
      if (leaveView) {
        await leaveView.leave();
        this.container.remove(leaveView.getContainer());
        leaveView.destroy();
      }

      const view = new View(this);
      this.container.add(view.getContainer());
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

  clear(): void {
    console.log('clear MenuScene');
    offEvent(this, MenuSceneTypes.Events.Play.Name, this.playHandler, this);
    offEvent(this, MenuSceneTypes.Events.GoToView.Name, this.goToViewHandler, this);
  }
}