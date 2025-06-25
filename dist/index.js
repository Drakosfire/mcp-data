/**
 * Sizzek MCP Data Storage
 * Independent storage abstraction layer for MCP servers
 *
 * Compatible with LibreChat and other MCP hosts
 * Supports user isolation, encryption, and multiple storage backends
 */
// Storage implementations
export { JsonUserStorage } from './storage/JsonStorage.js';
export { MongodbUserStorage } from './storage/MongodbStorage.js';
export { PaginatedGraphStorage } from './storage/PaginatedGraphStorage.js';
// Factory and utilities
export { StorageFactory, StorageConfigUtils } from './storage/StorageFactory.js';
// Version and metadata
export const VERSION = '1.0.0';
export const SUPPORTED_HOSTS = ['LibreChat', 'Generic MCP Host'];
export const SUPPORTED_STORAGE_TYPES = ['json', 'mongodb', 'paginated-graph'];
//# sourceMappingURL=index.js.map