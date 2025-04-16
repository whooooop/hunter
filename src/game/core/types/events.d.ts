// Simplified for testing
import { WaveEvents, WaveStartEventPayload } from '../controllers/WaveController';

// Расширяем модуль Phaser
declare module 'phaser' {
    // Расширяем интерфейс EventEmitter
    namespace Events {
        interface EventEmitter {
            // Only WaveStartEvent for now
            on(event: WaveEvents.WaveStartEvent, fn: (payload: WaveStartEventPayload) => void, context?: any): this;
            // on(event: WaveEvents.spawnEnemy, fn: (payload: EnemySpawnPayload) => void, context?: any): this;

            // on(event: GameEvent.ENEMY_DEATH, fn: (payload: EnemyDeathPayload) => void, context?: any): this;
            // on(event: GameEvent.ALL_WAVES_COMPLETED, fn: () => void, context?: any): this; // void payload
            // on(event: GameEvent.BLOOD_PARTICLE_DECAL, fn: (payload: DecalEventPayload) => void, context?: any): this;
            // on(event: GameEvent.SHELL_CASING_PARTICLE_DECAL, fn: (payload: DecalEventPayload) => void, context?: any): this;
            // on(event: GameEvent.WEAPON_AMMO_CHANGE, fn: (payload: WeaponAmmoChangePayload) => void, context?: any): this;
            // on(event: GameEvent.WEAPON_RELOAD_START, fn: (payload: WeaponReloadStartPayload) => void, context?: any): this;
            // on(event: GameEvent.WEAPON_RELOAD_END, fn: (payload: WeaponReloadEndPayload) => void, context?: any): this;
            // on(event: GameEvent.PLAYER_WEAPON_CHANGE, fn: (payload: PlayerWeaponChangePayload) => void, context?: any): this;
            // on(event: GameEvent.PLAYER_DEATH, fn: () => void, context?: any): this; // void payload
            // on(event: GameEvent.SHOP_OPEN, fn: () => void, context?: any): this; // void payload
            // on(event: GameEvent.SHOP_CLOSE, fn: () => void, context?: any): this; // void payload
            // on(event: GameEvent.SHOP_PURCHASE, fn: (payload: ShopPurchasePayload) => void, context?: any): this;

            // Опционально: оставляем оригинальную сигнатуру для обратной совместимости или нетипизированных событий
            // on(event: string | symbol, fn: Function, context?: any): this;

            // Определяем перегруженные методы EMIT для каждого события
            emit(event: WaveEvents.WaveStartEvent, payload: WaveStartEventPayload): boolean;
            // emit(event: WaveEvents.spawnEnemy, payload: EnemySpawnPayload): boolean;

            // emit(event: GameEvent.ENEMY_DEATH, payload: EnemyDeathPayload): boolean;
            // emit(event: GameEvent.ALL_WAVES_COMPLETED): boolean; // void payload
            // emit(event: GameEvent.BLOOD_PARTICLE_DECAL, payload: DecalEventPayload): boolean;
            // emit(event: GameEvent.SHELL_CASING_PARTICLE_DECAL, payload: DecalEventPayload): boolean;
            // emit(event: GameEvent.WEAPON_AMMO_CHANGE, payload: WeaponAmmoChangePayload): boolean;
            // emit(event: GameEvent.WEAPON_RELOAD_START, payload: WeaponReloadStartPayload): boolean;
            // emit(event: GameEvent.WEAPON_RELOAD_END, payload: WeaponReloadEndPayload): boolean;
            // emit(event: GameEvent.PLAYER_WEAPON_CHANGE, payload: PlayerWeaponChangePayload): boolean;
            // emit(event: GameEvent.PLAYER_DEATH): boolean; // void payload
            // emit(event: GameEvent.SHOP_OPEN): boolean; // void payload
            // emit(event: GameEvent.SHOP_CLOSE): boolean; // void payload
            // emit(event: GameEvent.SHOP_PURCHASE, payload: ShopPurchasePayload): boolean;
            // Добавьте сюда другие события по аналогии

            // Опционально: оставляем оригинальную сигнатуру
            // emit(event: string | symbol, ...args: any[]): boolean;
        }
    }
} 