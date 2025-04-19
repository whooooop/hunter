import { WeaponPurchasedPayload } from "../types/shopTypes";
import { PlayerSetWeaponEventPayload } from "../types/playerTypes";
import { WaveStartEventPayload } from "./WaveController";
import { WeaponFireEventsPayload } from "../types/weaponTypes";
import { onEvent } from "../Events";
import { EnemyDeathPayload, EnemyEntityEvents } from "../types/enemyTypes";
import { WeaponEvents } from "../types/weaponTypes";
import { WaveEvents, SpawnEnemyPayload } from "./WaveController";
import { ScoreEvents, UpdateScoreEventPayload } from "../types/scoreTypes";
import { PlayerEvents } from "../types/playerTypes";
import { ShopEvents } from "../types/shopTypes";

export class MultiplayerController {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(): void {
    onEvent(this.scene, WeaponEvents.FireEvent, (payload: WeaponFireEventsPayload) => this.handleFire(payload));
    onEvent(this.scene, WaveEvents.WaveStartEvent, (payload: WaveStartEventPayload) => this.handleWaveStart(payload));
    onEvent(this.scene, WaveEvents.SpawnEnemyEvent, (payload: SpawnEnemyPayload) => this.handleSpawnEnemy(payload));
    onEvent(this.scene, EnemyEntityEvents.enemyDeath, (payload: EnemyDeathPayload) => this.handleEnemyDeath(payload));
    onEvent(this.scene, ScoreEvents.UpdateScoreEvent, (payload: UpdateScoreEventPayload) => this.handleUpdateScore(payload));
    onEvent(this.scene, PlayerEvents.PlayerSetWeaponEvent, (payload: PlayerSetWeaponEventPayload) => this.handleSetWeapon(payload));
    onEvent(this.scene, ShopEvents.WeaponPurchasedEvent, (payload: WeaponPurchasedPayload) => this.handleWeaponPurchased(payload));
  }

  private handleFire(payload: WeaponFireEventsPayload): void {
    console.log('MULTIPLAYER CONTROLLER handleFire', payload);
  }

  private handleWaveStart(payload: WaveStartEventPayload): void {
    console.log('MULTIPLAYER CONTROLLER handleWaveStart', payload);
  }

  private handleSpawnEnemy(payload: SpawnEnemyPayload): void {
    console.log('MULTIPLAYER CONTROLLER handleSpawnEnemy', payload);
  }

  private handleEnemyDeath(payload: EnemyDeathPayload): void {
    console.log('MULTIPLAYER CONTROLLER handleEnemyDeath', payload);
  }

  private handleUpdateScore(payload: UpdateScoreEventPayload): void {
    console.log('MULTIPLAYER CONTROLLER handleUpdateScore', payload);
  }

  private handleSetWeapon(payload: PlayerSetWeaponEventPayload): void {
    console.log('MULTIPLAYER CONTROLLER handleSetWeapon', payload);
  }

  private handleWeaponPurchased(payload: WeaponPurchasedPayload): void {
    console.log('MULTIPLAYER CONTROLLER handleWeaponPurchased', payload);
  }
}