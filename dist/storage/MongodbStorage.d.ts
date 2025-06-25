/**
 * MongoDB Storage Implementation
 * Part of the Sizzek MCP Data project
 *
 * Features:
 * - User-isolated data storage
 * - Built-in encryption for sensitive data
 * - LibreChat-compatible encryption (when CREDS_KEY provided)
 * - Independent operation (doesn't require LibreChat)
 */
import { UserStorageInterface, EncryptedStorageInterface, StorageStats, StorageHealthInterface } from './StorageInterface.js';
export interface MongoStorageConfig {
    connectionString: string;
    databaseName?: string;
    collectionName: string;
    encryptionKey?: string;
    connectionTimeout?: number;
    maxRetries?: number;
}
export declare class MongodbUserStorage<T> implements UserStorageInterface<T>, EncryptedStorageInterface<T>, StorageHealthInterface {
    private client;
    private db;
    private collection;
    private defaultData;
    private isConnected;
    private encryptionKey;
    private algorithm;
    private config;
    constructor(config: MongoStorageConfig, defaultData: T);
    private getEncryptionKey;
    private encrypt;
    private decrypt;
    connect(): Promise<void>;
    private createIndexes;
    disconnect(): Promise<void>;
    saveForUser(userId: string, data: T): Promise<void>;
    loadForUser(userId: string): Promise<T>;
    existsForUser(userId: string): Promise<boolean>;
    clearForUser(userId: string): Promise<void>;
    listUsers(): Promise<string[]>;
    saveEncrypted(userId: string, data: T, encryptionKey?: string): Promise<void>;
    loadDecrypted(userId: string, encryptionKey?: string): Promise<T>;
    saveEncryptedBatch(userData: Record<string, T>, encryptionKey?: string): Promise<void>;
    loadDecryptedBatch(userIds: string[], encryptionKey?: string): Promise<Record<string, T>>;
    healthCheck(): Promise<boolean>;
    getStats(): Promise<StorageStats>;
    cleanup(): Promise<void>;
    save(data: T): Promise<void>;
    load(): Promise<T>;
    exists(): Promise<boolean>;
    clear(): Promise<void>;
    backup(): Promise<string>;
}
//# sourceMappingURL=MongodbStorage.d.ts.map