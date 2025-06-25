/**
 * JSON File Storage Implementation
 * Part of the Sizzek MCP Data project
 *
 * Features:
 * - File-based storage with user isolation
 * - Atomic writes with backup protection
 * - Independent operation (no external dependencies)
 * - Cross-platform file system support
 */
import { UserStorageInterface, StorageStats, StorageHealthInterface } from './StorageInterface.js';
export interface JsonStorageConfig {
    baseDir: string;
    createDirIfNotExists?: boolean;
    backupEnabled?: boolean;
    compressionEnabled?: boolean;
}
export declare class JsonUserStorage<T> implements UserStorageInterface<T>, StorageHealthInterface {
    private config;
    private defaultData;
    constructor(config: JsonStorageConfig, defaultData: T);
    private getUserFilePath;
    private getBackupFilePath;
    private getTempFilePath;
    saveForUser(userId: string, data: T): Promise<void>;
    loadForUser(userId: string): Promise<T>;
    existsForUser(userId: string): Promise<boolean>;
    clearForUser(userId: string): Promise<void>;
    listUsers(): Promise<string[]>;
    healthCheck(): Promise<boolean>;
    getStats(): Promise<StorageStats>;
    cleanup(): Promise<void>;
    save(data: T): Promise<void>;
    load(): Promise<T>;
    exists(): Promise<boolean>;
    clear(): Promise<void>;
    backup(): Promise<string>;
    getFileInfo(userId: string): Promise<{
        exists: boolean;
        size: number;
        lastModified: Date;
        hasBackup: boolean;
    } | null>;
}
//# sourceMappingURL=JsonStorage.d.ts.map