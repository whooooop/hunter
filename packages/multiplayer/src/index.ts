// Основной index файл для экспорта типов
export type {
  CollectionId,
  FromUpdate, SyncCollectionConfig, SyncCollectionEvent, SyncCollectionRecord
} from './Collection';
export type { StorageSpaceConfig, StorageSpaceId } from './StorageSpace';
export { MessageType, SyncCollectionEvents } from './sync';
export type { ClientId, NamespaceId } from './types';

// Экспорт классов без привязки к среде
export { BaseNamespace } from './BaseNamespace';
export { defineCollection, SyncCollection } from './Collection';
export { defineStorageSpace, StorageSpace } from './StorageSpace';

