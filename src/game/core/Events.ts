import * as Phaser from 'phaser';
import { MenuSceneTypes } from '../scenes/MenuScene/MenuSceneTypes';
import { Player, Enemy, Weapon, Game, Star, Quest, Blood, Decals, ScoreEvents, UpdateScoreEventPayload, IncreaseScoreEventPayload, DecreaseScoreEventPayload, ShopEvents, WeaponPurchasedPayload } from './types';
import { Wave } from './types/WaveTypes';

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
  [Wave.Events.WaveStart.Local]: Wave.Events.WaveStart.Payload;
  [Wave.Events.Spawn.Local]: Wave.Events.Spawn.Payload;

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

  // Game
  [Game.Events.Enemies.Local]: Game.Events.Enemies.Payload;
  [Game.Events.Pause.Local]: Game.Events.Pause.Payload;
  [Game.Events.Replay.Local]: Game.Events.Replay.Payload;
  [Game.Events.Resume.Local]: Game.Events.Resume.Payload;
  [Game.Events.Exit.Local]: Game.Events.Exit.Payload;
  [Game.Events.Stat.Local]: Game.Events.Stat.Payload;

  // Quest
  [Quest.Evants.QuestCompleted.Local]: Quest.Evants.QuestCompleted.Payload;
  [Quest.Evants.TaskCompleted.Local]: Quest.Evants.TaskCompleted.Payload;

  // Star
  [Star.Events.Increase.Local]: Star.Events.Increase.Payload;
  [Star.Events.Decrease.Local]: Star.Events.Decrease.Payload;
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