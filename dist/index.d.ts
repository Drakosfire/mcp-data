/**
 * Sizzek MCP Data Storage
 * Independent storage abstraction layer for MCP servers
 *
 * Compatible with LibreChat and other MCP hosts
 * Supports user isolation, encryption, and multiple storage backends
 */
export type { StorageInterface, UserStorageInterface, EncryptedStorageInterface, StorageStats, StorageHealthInterface } from './storage/StorageInterface.js';
export { JsonUserStorage } from './storage/JsonStorage.js';
export type { JsonStorageConfig } from './storage/JsonStorage.js';
export { MongodbUserStorage } from './storage/MongodbStorage.js';
export type { MongoStorageConfig } from './storage/MongodbStorage.js';
export { PaginatedGraphStorage } from './storage/PaginatedGraphStorage.js';
export type { Entity, Relation, KnowledgeGraph, GraphSummary } from './storage/PaginatedGraphStorage.js';
export { StorageFactory, StorageConfigUtils } from './storage/StorageFactory.js';
export type { UnifiedStorageConfig } from './storage/StorageFactory.js';
export declare const VERSION = "1.0.0";
export declare const SUPPORTED_HOSTS: string[];
export declare const SUPPORTED_STORAGE_TYPES: readonly ["json", "mongodb", "paginated-graph"];
//# sourceMappingURL=index.d.ts.map