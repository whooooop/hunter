import * as Phaser from 'phaser';
import { MenuSceneTypes } from './scenes/MenuScene/MenuSceneTypes';
import { Blood, Decals, DecreaseScoreEventPayload, Enemy, Game, IncreaseScoreEventPayload, Loading, ScoreEvents, Shop, ShopEvents, Weapon, WeaponPurchasedPayload } from './types';
import { Controls } from './types/ControlsTypes';

interface EventPayloadMap {
  // Weapons
  [Weapon.Events.CreateProjectile.Local]: Weapon.Events.CreateProjectile.Payload;
  [Weapon.Events.AimPoint.Local]: Weapon.Events.AimPoint.Payload;
  [Weapon.Events.Reloading.Local]: Weapon.Events.Reloading.Payload;

  // Enemies
  [Enemy.Events.Death.Local]: Enemy.Events.Death.Payload;

  // Score
  [ScoreEvents.IncreaseScoreEvent]: IncreaseScoreEventPayload;
  [ScoreEvents.DecreaseScoreEvent]: DecreaseScoreEventPayload;

  // Blood
  [Blood.Events.BloodSplash.Local]: Blood.Events.BloodSplash.Payload;
  [Blood.Events.ScreenBloodSplash.Local]: Blood.Events.ScreenBloodSplash.Payload;
  [Blood.Events.DeathFountain.Local]: Blood.Events.DeathFountain.Payload;

  // Shop
  [Shop.Events.Opened.Event]: Shop.Events.Opened.Payload;
  [ShopEvents.WeaponPurchasedEvent]: WeaponPurchasedPayload;

  // Decals
  [Decals.Events.Local]: Decals.Events.Payload;

  // Menu
  [MenuSceneTypes.Events.Play.Name]: MenuSceneTypes.Events.Play.Payload;
  [MenuSceneTypes.Events.GoToView.Name]: MenuSceneTypes.Events.GoToView.Payload;

  // Controls
  [Controls.Events.Move.Event]: Controls.Events.Move.Payload;
  [Controls.Events.Fire.Event]: Controls.Events.Fire.Payload;
  [Controls.Events.Reload.Event]: Controls.Events.Reload.Payload;
  [Controls.Events.Jump.Event]: Controls.Events.Jump.Payload;
  [Controls.Events.NextWeapon.Event]: Controls.Events.NextWeapon.Payload;
  [Controls.Events.PrevWeapon.Event]: Controls.Events.PrevWeapon.Payload;
  [Controls.Events.Shop.Event]: Controls.Events.Shop.Payload;
  [Controls.Events.KeyUp.Event]: Controls.Events.KeyUp.Payload;
  [Controls.Events.KeyDown.Event]: Controls.Events.KeyDown.Payload;
  [Controls.Events.KeyLeft.Event]: Controls.Events.KeyLeft.Payload;
  [Controls.Events.KeyRight.Event]: Controls.Events.KeyRight.Payload;
  [Controls.Events.NumberKey.Event]: Controls.Events.NumberKey.Payload;

  // Game
  [Game.Events.Pause.Local]: Game.Events.Pause.Payload;
  [Game.Events.Replay.Local]: Game.Events.Replay.Payload;
  [Game.Events.ResumeWithAds.Local]: Game.Events.ResumeWithAds.Payload;
  [Game.Events.Resume.Local]: Game.Events.Resume.Payload;
  [Game.Events.Exit.Local]: Game.Events.Exit.Payload;
  [Game.Events.Stat.Local]: Game.Events.Stat.Payload;

  // Loading
  [Loading.Events.LoadingComplete.Local]: Loading.Events.LoadingComplete.Payload;

}

export function emitEvent<E extends keyof EventPayloadMap>(scene: Phaser.Scene, name: E, payload: EventPayloadMap[E]): void;
export function emitEvent<E extends keyof EventPayloadMap>(
  scene: Phaser.Scene,
  name: E,
  ...args: EventPayloadMap[E] extends void ? [] : [EventPayloadMap[E]]
): void {
  scene.events.emit(name, ...args);
}

// Перегрузка для onEvent
// 1. Для событий с payload
export function onEvent<E extends keyof EventPayloadMap>(
  scene: Phaser.Scene,
  name: E,
  callback: (payload: EventPayloadMap[E]) => void,
  context?: any
): void;
export function onEvent<E extends keyof EventPayloadMap>(
  scene: Phaser.Scene,
  name: E,
  callback: EventPayloadMap[E] extends void ? () => void : (payload: EventPayloadMap[E]) => void,
  context?: any
): void {
  scene.events.on(name, callback, context);
}

export function offEvent<E extends keyof EventPayloadMap>(
  scene: Phaser.Scene,
  name: E,
  callback: (payload: EventPayloadMap[E]) => void,
  context?: any
): void;
export function offEvent<E extends keyof EventPayloadMap>(
  scene: Phaser.Scene,
  name: E,
  callback: EventPayloadMap[E] extends void ? () => void : (payload: EventPayloadMap[E]) => void,
  context?: any
): void {
  scene.events.off(name, callback, context);
} 