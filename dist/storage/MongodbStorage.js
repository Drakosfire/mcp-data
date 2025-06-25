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
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
export class MongodbUserStorage {
    client;
    db;
    collection;
    defaultData;
    isConnected = false;
    encryptionKey;
    algorithm = 'aes-256-ctr';
    config;
    constructor(config, defaultData) {
        this.config = {
            databaseName: 'mcp-data',
            connectionTimeout: 10000,
            maxRetries: 3,
            ...config
        };
        this.client = new MongoClient(this.config.connectionString, {
            connectTimeoutMS: this.config.connectionTimeout,
            serverSelectionTimeoutMS: this.config.connectionTimeout
        });
        this.db = this.client.db(this.config.databaseName);
        this.collection = this.db.collection(this.config.collectionName);
        this.defaultData = defaultData;
        // Set up encryption key
        this.encryptionKey = this.getEncryptionKey();
    }
    getEncryptionKey() {
        // Priority order for encryption keys:
        // 1. Explicitly provided key
        // 2. LibreChat's CREDS_KEY (for compatibility)
        // 3. Generate random key (not recommended for production)
        if (this.config.encryptionKey) {
            return this.config.encryptionKey.length === 64
                ? this.config.encryptionKey
                : crypto.createHash('sha256').update(this.config.encryptionKey).digest('hex');
        }
        const librechatKey = process.env.CREDS_KEY;
        if (librechatKey && librechatKey.length === 64) {
            console.log('[MongodbStorage] Using LibreChat CREDS_KEY for encryption compatibility');
            return librechatKey;
        }
        console.warn('[MongodbStorage] No encryption key provided. Generating random key (NOT SECURE FOR PRODUCTION)');
        return crypto.randomBytes(32).toString('hex');
    }
    encrypt(text, key) {
        const encKey = key || this.encryptionKey;
        const keyBuffer = Buffer.from(encKey, 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }
    decrypt(encryptedText, key) {
        const encKey = key || this.encryptionKey;
        const keyBuffer = Buffer.from(encKey, 'hex');
        const [ivHex, encryptedHex] = encryptedText.split(':');
        if (!ivHex || !encryptedHex) {
            throw new Error('Invalid encrypted data format');
        }
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    }
    async connect() {
        if (!this.isConnected) {
            let retries = 0;
            while (retries < this.config.maxRetries) {
                try {
                    await this.client.connect();
                    this.isConnected = true;
                    console.log(`[MongodbStorage] Connected to ${this.db.databaseName}.${this.collection.collectionName}`);
                    await this.createIndexes();
                    return;
                }
                catch (error) {
                    retries++;
                    console.error(`[MongodbStorage] Connection attempt ${retries} failed:`, error);
                    if (retries >= this.config.maxRetries) {
                        throw new Error(`Failed to connect to MongoDB after ${retries} attempts`);
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                }
            }
        }
    }
    async createIndexes() {
        try {
            await Promise.all([
                this.collection.createIndex({ "userId": 1 }),
                this.collection.createIndex({ "updatedAt": -1 }),
                this.collection.createIndex({ "userId": 1, "dataType": 1 }),
                this.collection.createIndex({ "createdAt": -1 }),
                this.collection.createIndex({ "isEncrypted": 1 })
            ]);
        }
        catch (error) {
            console.warn('[MongodbStorage] Failed to create indexes:', error);
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.client.close();
            this.isConnected = false;
            console.log('[MongodbStorage] Disconnected from MongoDB');
        }
    }
    // Basic storage methods
    async saveForUser(userId, data) {
        await this.connect();
        const document = {
            userId,
            data,
            updatedAt: new Date(),
            createdAt: new Date(),
            dataType: this.collection.collectionName,
            isEncrypted: false,
            version: '1.0.0'
        };
        await this.collection.replaceOne({ userId }, document, { upsert: true });
    }
    async loadForUser(userId) {
        await this.connect();
        const document = await this.collection.findOne({ userId });
        if (document && document.data) {
            return document.data;
        }
        return structuredClone(this.defaultData);
    }
    async existsForUser(userId) {
        await this.connect();
        const count = await this.collection.countDocuments({ userId });
        return count > 0;
    }
    async clearForUser(userId) {
        await this.connect();
        await this.collection.deleteOne({ userId });
    }
    async listUsers() {
        await this.connect();
        const users = await this.collection.distinct('userId');
        return users;
    }
    // Encrypted storage methods
    async saveEncrypted(userId, data, encryptionKey) {
        await this.connect();
        const encryptedData = this.encrypt(JSON.stringify(data), encryptionKey);
        const document = {
            userId,
            encryptedData,
            isEncrypted: true,
            updatedAt: new Date(),
            createdAt: new Date(),
            dataType: this.collection.collectionName,
            version: '1.0.0'
        };
        await this.collection.replaceOne({ userId }, document, { upsert: true });
    }
    async loadDecrypted(userId, encryptionKey) {
        await this.connect();
        const document = await this.collection.findOne({ userId });
        if (document && document.encryptedData && document.isEncrypted) {
            try {
                const decryptedString = this.decrypt(document.encryptedData, encryptionKey);
                return JSON.parse(decryptedString);
            }
            catch (error) {
                console.error(`[MongodbStorage] Failed to decrypt data for user ${userId}:`, error);
                return structuredClone(this.defaultData);
            }
        }
        // Fallback to regular data or default
        if (document && document.data) {
            return document.data;
        }
        return structuredClone(this.defaultData);
    }
    // Batch operations for efficiency
    async saveEncryptedBatch(userData, encryptionKey) {
        await this.connect();
        const operations = Object.entries(userData).map(([userId, data]) => ({
            replaceOne: {
                filter: { userId },
                replacement: {
                    userId,
                    encryptedData: this.encrypt(JSON.stringify(data), encryptionKey),
                    isEncrypted: true,
                    updatedAt: new Date(),
                    createdAt: new Date(),
                    dataType: this.collection.collectionName,
                    version: '1.0.0'
                },
                upsert: true
            }
        }));
        if (operations.length > 0) {
            await this.collection.bulkWrite(operations);
        }
    }
    async loadDecryptedBatch(userIds, encryptionKey) {
        await this.connect();
        const documents = await this.collection.find({
            userId: { $in: userIds }
        }).toArray();
        const result = {};
        for (const doc of documents) {
            try {
                if (doc.encryptedData && doc.isEncrypted) {
                    const decryptedString = this.decrypt(doc.encryptedData, encryptionKey);
                    result[doc.userId] = JSON.parse(decryptedString);
                }
                else if (doc.data) {
                    result[doc.userId] = doc.data;
                }
            }
            catch (error) {
                console.error(`[MongodbStorage] Failed to decrypt data for user ${doc.userId}:`, error);
                result[doc.userId] = structuredClone(this.defaultData);
            }
        }
        // Fill in missing users with default data
        for (const userId of userIds) {
            if (!result[userId]) {
                result[userId] = structuredClone(this.defaultData);
            }
        }
        return result;
    }
    // Health and stats methods
    async healthCheck() {
        try {
            await this.connect();
            const result = await this.db.admin().ping();
            return result.ok === 1;
        }
        catch (error) {
            console.error('[MongodbStorage] Health check failed:', error);
            return false;
        }
    }
    async getStats() {
        await this.connect();
        const userCount = await this.collection.countDocuments({});
        let totalSize = 0;
        try {
            // Use MongoDB's db.runCommand to get collection stats
            const stats = await this.db.command({ collStats: this.collection.collectionName });
            totalSize = stats.size || 0;
        }
        catch (error) {
            // If stats command fails, estimate size or use 0
            console.warn('[MongodbStorage] Could not get collection stats:', error);
            totalSize = 0;
        }
        return {
            totalUsers: userCount,
            totalSize: totalSize,
            lastAccessed: new Date(),
            collections: [this.collection.collectionName]
        };
    }
    async cleanup() {
        await this.connect();
        // Remove documents older than 1 year with no recent updates
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const result = await this.collection.deleteMany({
            updatedAt: { $lt: oneYearAgo }
        });
        if (result.deletedCount > 0) {
            console.log(`[MongodbStorage] Cleaned up ${result.deletedCount} old documents`);
        }
    }
    // Legacy compatibility methods
    async save(data) {
        await this.saveForUser('default', data);
    }
    async load() {
        return await this.loadForUser('default');
    }
    async exists() {
        return await this.existsForUser('default');
    }
    async clear() {
        await this.clearForUser('default');
    }
    async backup() {
        await this.connect();
        const allData = await this.collection.find({}).toArray();
        const backupData = {
            timestamp: new Date().toISOString(),
            collection: this.collection.collectionName,
            database: this.db.databaseName,
            version: '1.0.0',
            totalDocuments: allData.length,
            data: allData
        };
        return JSON.stringify(backupData, null, 2);
    }
}
//# sourceMappingURL=MongodbStorage.js.map