import * as Phaser from 'phaser';
import { WeaponEvents, WeaponFireEventsPayload } from './entities/WeaponEntity';
import { WaveStartEventPayload } from './controllers/WaveController';
import { WaveEvents } from './controllers/WaveController';
import { DamageableEntity } from './entities/DamageableEntity';
import { EnemyEntityEvents } from './entities/EnemyEntity';
import { DecalEventPayload } from './types/decals';
import { ShellCasingEvents } from './entities/ShellCasingEntity';
import { BloodEvents } from './controllers/BloodController';

interface EventPayloadMap {
    // Weapons
    [WeaponEvents.FireEvent]: WeaponFireEventsPayload;

    // Waves
    [WaveEvents.WaveStartEvent]: WaveStartEventPayload;
    [WaveEvents.SpawnEnemyEvent]: DamageableEntity;

    // Enemies
    [EnemyEntityEvents.enemyDeath]: DecalEventPayload;

    // Decals
    [ShellCasingEvents.shellCasingParticleDecal]: DecalEventPayload;
    [BloodEvents.bloodParticleDecal]: DecalEventPayload;
}

// Перегрузка для emitEvent
// 1. Для событий с payload
export function emitEvent<E extends keyof EventPayloadMap>(scene: Phaser.Scene, name: E, payload: EventPayloadMap[E]): void;
// 2. Для событий без payload (void)
export function emitEvent<E extends keyof EventPayloadMap>(
    scene: Phaser.Scene, 
    name: E, 
    ...args: EventPayloadMap[E] extends void ? [] : [EventPayloadMap[E]] // Разрешаем payload только если он не void
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
// 2. Для событий без payload (void)
export function onEvent<E extends keyof EventPayloadMap>(
    scene: Phaser.Scene, 
    name: E, 
    callback: EventPayloadMap[E] extends void ? () => void : (payload: EventPayloadMap[E]) => void, 
    context?: any
): void {
    scene.events.on(name, callback, context);
}
