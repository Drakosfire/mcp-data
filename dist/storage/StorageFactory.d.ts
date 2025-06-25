/**
 * Storage Factory for MCP Data
 * Part of the Sizzek project - Independent from LibreChat but compatible
 *
 * Provides dynamic storage creation based on configuration
 * Supports both JSON file storage and MongoDB storage
 */
import { JsonStorageConfig } from './JsonStorage.js';
import { MongoStorageConfig } from './MongodbStorage.js';
import { PaginatedGraphStorage } from './PaginatedGraphStorage.js';
import { UserStorageInterface, EncryptedStorageInterface } from './StorageInterface.js';
export interface UnifiedStorageConfig {
    type: 'json' | 'mongodb' | 'paginated-graph';
    json?: JsonStorageConfig;
    mongodb?: MongoStorageConfig;
    paginatedGraph?: {
        connectionString: string;
        databaseName?: string;
        collectionPrefix?: string;
    };
    encryptionKey?: string;
    environment?: 'development' | 'production' | 'test';
}
export declare class StorageFactory {
    /**
     * Creates a user storage instance based on provided configuration
     */
    static createUserStorage<T>(config: UnifiedStorageConfig, defaultData: T): UserStorageInterface<T>;
    /**
     * Creates encrypted storage (MongoDB only)
     */
    static createEncryptedStorage<T>(config: UnifiedStorageConfig, defaultData: T): EncryptedStorageInterface<T>;
    /**
     * Creates storage based on environment variables
     * This provides compatibility with various MCP hosts including LibreChat
     */
    static createFromEnvironment<T>(defaultData: T): UserStorageInterface<T>;
    /**
     * Creates encrypted storage from environment variables
     * Specifically for storing sensitive data like API keys
     */
    static createEncryptedFromEnvironment<T>(defaultData: T): EncryptedStorageInterface<T>;
    /**
     * Creates storage optimized for LibreChat integration
     * Uses LibreChat's existing connection and encryption system
     */
    static createForLibreChat<T>(collectionName: string, defaultData: T, useEncryption?: boolean): UserStorageInterface<T> | EncryptedStorageInterface<T>;
    /**
     * Creates a paginated graph storage optimized for knowledge graphs
     * This is ideal for memory/knowledge MCP servers that need to store large graphs
     */
    static createGraphStorage(connectionString: string, databaseName?: string, collectionPrefix?: string): PaginatedGraphStorage;
    /**
     * Creates graph storage from environment variables
     * Compatible with LibreChat and other MCP hosts
     */
    static createGraphStorageFromEnvironment(): PaginatedGraphStorage;
    /**
     * Creates a test storage instance (in-memory or temporary)
     * Useful for testing MCP servers
     */
    static createTestStorage<T>(defaultData: T): UserStorageInterface<T>;
    /**
     * Auto-detects best storage configuration based on environment
     * Provides intelligent defaults for different deployment scenarios
     */
    static createAutoDetected<T>(defaultData: T): UserStorageInterface<T>;
}
/**
 * Utility functions for storage configuration
 */
export declare class StorageConfigUtils {
    /**
     * Validates storage configuration
     */
    static validateConfig(config: UnifiedStorageConfig): boolean;
    /**
     * Creates a configuration for development environment
     */
    static createDevConfig(baseDir?: string): UnifiedStorageConfig;
    /**
     * Creates a configuration for production environment with MongoDB
     */
    static createProdConfig(connectionString: string, encryptionKey: string, collectionName?: string): UnifiedStorageConfig;
}
//# sourceMappingURL=StorageFactory.d.ts.map