import * as Phaser from 'phaser';
import { SpawnEnemyPayload, WaveStartEventPayload } from './controllers/WaveController';
import { WaveEvents } from './controllers/WaveController';
import { Decals } from './types/decals';
import { Weapon } from './types/weaponTypes';
import { Enemy } from './types/enemyTypes';
import { ScoreEvents, UpdateScoreEventPayload, IncreaseScoreEventPayload, DecreaseScoreEventPayload } from './types/scoreTypes';
import { Player } from './types/playerTypes';
import { ShopEvents, WeaponPurchasedPayload } from './types/shopTypes';
import { Game } from './types/gameTypes';
import { MenuSceneTypes } from '../scenes/MenuScene/MenuSceneTypes';
import { Blood } from './types/BloodTypes';
interface EventPayloadMap {
  // Game
  [Game.Events.State.Remote]: Game.Events.State.Payload;

  // Weapons
  [Weapon.Events.CreateProjectile.Local]: Weapon.Events.CreateProjectile.Payload;
  [Weapon.Events.CreateProjectile.Remote]: Weapon.Events.CreateProjectile.Payload;
  [Weapon.Events.FireAction.Local]: Weapon.Events.FireAction.Payload;
  [Weapon.Events.FireAction.Remote]: Weapon.Events.FireAction.Payload;
  [Weapon.Events.ReloadAction.Local]: Weapon.Events.ReloadAction.Payload;
  [Weapon.Events.ReloadAction.Remote]: Weapon.Events.ReloadAction.Payload;
  [Weapon.Events.AimPoint.Local]: Weapon.Events.AimPoint.Payload;

  // Waves
  [WaveEvents.WaveStartEvent]: WaveStartEventPayload;
  [WaveEvents.SpawnEnemyEvent]: SpawnEnemyPayload;

  // Enemies
  [Enemy.Events.Death.Local]: Enemy.Events.Death.Payload;

  // Score
  [ScoreEvents.IncreaseScoreEvent]: IncreaseScoreEventPayload;
  [ScoreEvents.DecreaseScoreEvent]: DecreaseScoreEventPayload;
  [ScoreEvents.UpdateScoreEvent]: UpdateScoreEventPayload;

  // Player
  [Player.Events.SetWeapon.Local]: Player.Events.SetWeapon.Payload;
  [Player.Events.State.Local]: Player.Events.State.Payload;
  [Player.Events.SetWeapon.Remote]: Player.Events.SetWeapon.Payload;
  [Player.Events.State.Remote]: Player.Events.State.Payload;
  [Player.Events.Join.Remote]: Player.Events.Join.Payload;
  [Player.Events.Left.Remote]: Player.Events.Left.Payload;
  [Player.Events.ChangeWeapon.Local]: Player.Events.ChangeWeapon.Payload;

  // Blood
  [Blood.Events.BloodSplash.Local]: Blood.Events.BloodSplash.Payload;
  [Blood.Events.ScreenBloodSplash.Local]: Blood.Events.ScreenBloodSplash.Payload;

  // Shop
  [ShopEvents.WeaponPurchasedEvent]: WeaponPurchasedPayload;

  // Decals
  [Decals.Events.Local]: Decals.Events.Payload;

  // Menu
  [MenuSceneTypes.Events.Play.Name]: MenuSceneTypes.Events.Play.Payload;
  [MenuSceneTypes.Events.GoToView.Name]: MenuSceneTypes.Events.GoToView.Payload;

  // Pause
  [Game.Events.Pause.Local]: Game.Events.Pause.Payload;
  [Game.Events.Replay.Local]: Game.Events.Replay.Payload;
  [Game.Events.Resume.Local]: Game.Events.Resume.Payload;
  [Game.Events.Exit.Local]: Game.Events.Exit.Payload;
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