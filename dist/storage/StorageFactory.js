/**
 * Storage Factory for MCP Data
 * Part of the Sizzek project - Independent from LibreChat but compatible
 *
 * Provides dynamic storage creation based on configuration
 * Supports both JSON file storage and MongoDB storage
 */
import { JsonUserStorage } from './JsonStorage.js';
import { MongodbUserStorage } from './MongodbStorage.js';
import { PaginatedGraphStorage } from './PaginatedGraphStorage.js';
export class StorageFactory {
    /**
     * Creates a user storage instance based on provided configuration
     */
    static createUserStorage(config, defaultData) {
        switch (config.type) {
            case 'json':
                if (!config.json) {
                    throw new Error('JSON storage selected but no JSON configuration provided');
                }
                return new JsonUserStorage(config.json, defaultData);
            case 'mongodb':
                if (!config.mongodb) {
                    throw new Error('MongoDB storage selected but no MongoDB configuration provided');
                }
                // Add encryption key to MongoDB config if provided
                const mongoConfig = config.encryptionKey
                    ? { ...config.mongodb, encryptionKey: config.encryptionKey }
                    : config.mongodb;
                return new MongodbUserStorage(mongoConfig, defaultData);
            case 'paginated-graph':
                if (!config.paginatedGraph) {
                    throw new Error('Paginated graph storage selected but no configuration provided');
                }
                // Only works with KnowledgeGraph type
                if (defaultData && typeof defaultData === 'object' &&
                    ('entities' in defaultData || 'relations' in defaultData)) {
                    return new PaginatedGraphStorage(config.paginatedGraph.connectionString, config.paginatedGraph.databaseName, config.paginatedGraph.collectionPrefix);
                }
                else {
                    throw new Error('Paginated graph storage only supports KnowledgeGraph data type');
                }
            default:
                throw new Error(`Unknown storage type: ${config.type}`);
        }
    }
    /**
     * Creates encrypted storage (MongoDB only)
     */
    static createEncryptedStorage(config, defaultData) {
        if (config.type !== 'mongodb') {
            throw new Error('Encrypted storage is only available with MongoDB storage');
        }
        if (!config.mongodb) {
            throw new Error('MongoDB configuration required for encrypted storage');
        }
        const mongoConfig = config.encryptionKey
            ? { ...config.mongodb, encryptionKey: config.encryptionKey }
            : config.mongodb;
        return new MongodbUserStorage(mongoConfig, defaultData);
    }
    /**
     * Creates storage based on environment variables
     * This provides compatibility with various MCP hosts including LibreChat
     */
    static createFromEnvironment(defaultData) {
        const storageType = process.env.MCP_STORAGE_TYPE || 'json';
        const config = {
            type: storageType,
            encryptionKey: process.env.CREDS_KEY || process.env.MCP_ENCRYPTION_KEY,
            environment: process.env.NODE_ENV || 'development'
        };
        if (storageType === 'mongodb') {
            config.mongodb = {
                connectionString: process.env.MONGODB_CONNECTION_STRING ||
                    process.env.MCP_MONGODB_URI ||
                    'mongodb://localhost:27017/mcp-data',
                databaseName: process.env.MONGODB_DATABASE ||
                    process.env.MCP_MONGODB_DATABASE ||
                    'mcp-data',
                collectionName: process.env.MONGODB_COLLECTION ||
                    process.env.MCP_MONGODB_COLLECTION ||
                    'mcp_storage',
                connectionTimeout: parseInt(process.env.MCP_MONGODB_TIMEOUT || '10000'),
                maxRetries: parseInt(process.env.MCP_MONGODB_RETRIES || '3')
            };
        }
        else {
            config.json = {
                baseDir: process.env.STORAGE_FILE_PATH ||
                    process.env.MCP_STORAGE_PATH ||
                    './storage_files',
                createDirIfNotExists: true,
                backupEnabled: process.env.MCP_BACKUP_ENABLED !== 'false'
            };
        }
        return StorageFactory.createUserStorage(config, defaultData);
    }
    /**
     * Creates encrypted storage from environment variables
     * Specifically for storing sensitive data like API keys
     */
    static createEncryptedFromEnvironment(defaultData) {
        const config = {
            type: 'mongodb', // Encryption only supported with MongoDB
            encryptionKey: process.env.CREDS_KEY || process.env.MCP_ENCRYPTION_KEY,
            mongodb: {
                connectionString: process.env.MONGODB_CONNECTION_STRING ||
                    process.env.MCP_MONGODB_URI ||
                    'mongodb://localhost:27017/mcp-data',
                databaseName: process.env.MONGODB_DATABASE ||
                    process.env.MCP_MONGODB_DATABASE ||
                    'mcp-data',
                collectionName: process.env.MONGODB_COLLECTION ||
                    process.env.MCP_MONGODB_COLLECTION ||
                    'mcp_encrypted_storage',
                connectionTimeout: parseInt(process.env.MCP_MONGODB_TIMEOUT || '10000'),
                maxRetries: parseInt(process.env.MCP_MONGODB_RETRIES || '3')
            }
        };
        if (!config.encryptionKey) {
            console.warn('[StorageFactory] No encryption key found in environment. Encryption may not work properly.');
        }
        return StorageFactory.createEncryptedStorage(config, defaultData);
    }
    /**
     * Creates storage optimized for LibreChat integration
     * Uses LibreChat's existing connection and encryption system
     */
    static createForLibreChat(collectionName, defaultData, useEncryption = false) {
        const config = {
            type: 'mongodb',
            encryptionKey: process.env.CREDS_KEY, // Use LibreChat's encryption key
            mongodb: {
                connectionString: process.env.MONGO_URI || 'mongodb://mongodb:27017/LibreChat',
                databaseName: 'mcp-data', // Separate database from LibreChat
                collectionName: collectionName,
                connectionTimeout: 10000,
                maxRetries: 3
            }
        };
        if (useEncryption) {
            return StorageFactory.createEncryptedStorage(config, defaultData);
        }
        else {
            return StorageFactory.createUserStorage(config, defaultData);
        }
    }
    /**
     * Creates a paginated graph storage optimized for knowledge graphs
     * This is ideal for memory/knowledge MCP servers that need to store large graphs
     */
    static createGraphStorage(connectionString, databaseName = 'LibreChat', collectionPrefix = 'mcp_memory') {
        return new PaginatedGraphStorage(connectionString, databaseName, collectionPrefix);
    }
    /**
     * Creates graph storage from environment variables
     * Compatible with LibreChat and other MCP hosts
     */
    static createGraphStorageFromEnvironment() {
        const connectionString = process.env.MONGODB_CONNECTION_STRING ||
            process.env.MCP_MONGODB_URI ||
            process.env.MONGO_URI ||
            'mongodb://localhost:27017/LibreChat';
        const databaseName = process.env.MONGODB_DATABASE ||
            process.env.MCP_MONGODB_DATABASE ||
            'LibreChat';
        const collectionPrefix = process.env.MONGODB_COLLECTION_PREFIX ||
            process.env.MCP_MONGODB_COLLECTION ||
            'mcp_memory';
        return StorageFactory.createGraphStorage(connectionString, databaseName, collectionPrefix);
    }
    /**
     * Creates a test storage instance (in-memory or temporary)
     * Useful for testing MCP servers
     */
    static createTestStorage(defaultData) {
        const testDir = `/tmp/mcp-test-storage-${Date.now()}`;
        const config = {
            type: 'json',
            json: {
                baseDir: testDir,
                createDirIfNotExists: true,
                backupEnabled: false // No backup needed for tests
            }
        };
        return StorageFactory.createUserStorage(config, defaultData);
    }
    /**
     * Auto-detects best storage configuration based on environment
     * Provides intelligent defaults for different deployment scenarios
     */
    static createAutoDetected(defaultData) {
        // Try MongoDB first if connection string is available
        const mongoUri = process.env.MONGODB_CONNECTION_STRING ||
            process.env.MCP_MONGODB_URI ||
            process.env.MONGO_URI;
        if (mongoUri) {
            try {
                return StorageFactory.createFromEnvironment(defaultData);
            }
            catch (error) {
                console.warn('[StorageFactory] MongoDB connection failed, falling back to JSON storage:', error);
            }
        }
        // Fallback to JSON storage
        const config = {
            type: 'json',
            json: {
                baseDir: process.env.MCP_STORAGE_PATH || './storage_files',
                createDirIfNotExists: true,
                backupEnabled: true
            }
        };
        return StorageFactory.createUserStorage(config, defaultData);
    }
}
/**
 * Utility functions for storage configuration
 */
export class StorageConfigUtils {
    /**
     * Validates storage configuration
     */
    static validateConfig(config) {
        if (!config.type) {
            return false;
        }
        if (config.type === 'mongodb' && !config.mongodb?.connectionString) {
            return false;
        }
        if (config.type === 'json' && !config.json?.baseDir) {
            return false;
        }
        return true;
    }
    /**
     * Creates a configuration for development environment
     */
    static createDevConfig(baseDir = './dev-storage') {
        return {
            type: 'json',
            environment: 'development',
            json: {
                baseDir,
                createDirIfNotExists: true,
                backupEnabled: true
            }
        };
    }
    /**
     * Creates a configuration for production environment with MongoDB
     */
    static createProdConfig(connectionString, encryptionKey, collectionName = 'mcp_storage') {
        return {
            type: 'mongodb',
            environment: 'production',
            encryptionKey,
            mongodb: {
                connectionString,
                databaseName: 'mcp-data',
                collectionName,
                connectionTimeout: 15000,
                maxRetries: 5
            }
        };
    }
}
//# sourceMappingURL=StorageFactory.js.map