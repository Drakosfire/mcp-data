/**
 * Example: LibreChat Integration with Sizzek MCP Data Storage
 *
 * This example shows how to use the Sizzek MCP Data storage system
 * with LibreChat for SMS user management and MCP servers.
 */
import { StorageFactory } from '../storage/StorageFactory.js';
export class SMSMemoryManager {
    storage;
    constructor() {
        // Use LibreChat-compatible storage configuration
        this.storage = StorageFactory.createForLibreChat('sms_user_memory', {
            entities: [],
            relations: []
        }, false // No encryption needed for memory facts
        );
    }
    async rememberFact(phoneNumber, fact, entityName) {
        const memory = await this.storage.loadForUser(phoneNumber);
        // Find or create entity
        let entity = memory.entities.find(e => e.name === entityName);
        if (!entity) {
            entity = {
                name: entityName,
                type: 'user_fact',
                observations: []
            };
            memory.entities.push(entity);
        }
        // Add observation if not already present
        if (!entity.observations.includes(fact)) {
            entity.observations.push(fact);
        }
        await this.storage.saveForUser(phoneNumber, memory);
        console.log(`[SMS Memory] Stored fact for ${phoneNumber}: ${fact}`);
    }
    async getFactsAbout(phoneNumber, entityName) {
        const memory = await this.storage.loadForUser(phoneNumber);
        const entity = memory.entities.find(e => e.name === entityName);
        return entity?.observations || [];
    }
    async getAllMemories(phoneNumber) {
        return await this.storage.loadForUser(phoneNumber);
    }
}
export class SMSCredentialsManager {
    storage;
    constructor() {
        // Use encrypted storage for sensitive API credentials
        this.storage = StorageFactory.createForLibreChat('sms_google_credentials', {
            clientId: '',
            clientSecret: '',
            accessToken: '',
            refreshToken: '',
            expiresAt: ''
        }, true // Enable encryption for sensitive data
        );
    }
    async storeCredentials(phoneNumber, credentials) {
        await this.storage.saveEncrypted(phoneNumber, credentials);
        console.log(`[SMS Credentials] Stored encrypted credentials for ${phoneNumber}`);
    }
    async getCredentials(phoneNumber) {
        try {
            const credentials = await this.storage.loadDecrypted(phoneNumber);
            // Validate that we have required credentials
            if (!credentials.clientId || !credentials.clientSecret) {
                return null;
            }
            return credentials;
        }
        catch (error) {
            console.error(`[SMS Credentials] Failed to load credentials for ${phoneNumber}:`, error);
            return null;
        }
    }
    async hasCredentials(phoneNumber) {
        const credentials = await this.getCredentials(phoneNumber);
        return credentials !== null;
    }
    async updateTokens(phoneNumber, accessToken, refreshToken, expiresAt) {
        const existing = await this.getCredentials(phoneNumber);
        if (!existing) {
            throw new Error('No existing credentials found for user');
        }
        const updated = {
            ...existing,
            accessToken,
            refreshToken: refreshToken || existing.refreshToken,
            expiresAt: expiresAt || existing.expiresAt
        };
        await this.storage.saveEncrypted(phoneNumber, updated);
        console.log(`[SMS Credentials] Updated tokens for ${phoneNumber}`);
    }
}
export class SMSTodoManager {
    storage;
    constructor() {
        this.storage = StorageFactory.createForLibreChat('sms_user_todos', {
            items: [],
            lastUpdated: new Date().toISOString()
        });
    }
    async addTodo(phoneNumber, text, dueDate) {
        const todos = await this.storage.loadForUser(phoneNumber);
        const newTodo = {
            id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate
        };
        todos.items.push(newTodo);
        todos.lastUpdated = new Date().toISOString();
        await this.storage.saveForUser(phoneNumber, todos);
        console.log(`[SMS Todos] Added todo for ${phoneNumber}: ${text}`);
        return newTodo.id;
    }
    async getTodos(phoneNumber, includeCompleted = false) {
        const todos = await this.storage.loadForUser(phoneNumber);
        if (includeCompleted) {
            return todos.items;
        }
        return todos.items.filter(item => !item.completed);
    }
    async completeTodo(phoneNumber, todoId) {
        const todos = await this.storage.loadForUser(phoneNumber);
        const todo = todos.items.find(item => item.id === todoId);
        if (!todo) {
            return false;
        }
        todo.completed = true;
        todos.lastUpdated = new Date().toISOString();
        await this.storage.saveForUser(phoneNumber, todos);
        console.log(`[SMS Todos] Completed todo for ${phoneNumber}: ${todo.text}`);
        return true;
    }
}
// Example 4: Environment Configuration for LibreChat
export function configureForLibreChat() {
    // These environment variables would be set in LibreChat's configuration
    const config = {
        // Storage configuration
        MCP_STORAGE_TYPE: 'mongodb',
        // MongoDB connection (using LibreChat's MongoDB instance)
        MONGODB_CONNECTION_STRING: process.env.MONGO_URI || 'mongodb://mongodb:27017/LibreChat',
        MONGODB_DATABASE: 'mcp-data', // Separate database for MCP data
        // Encryption (using LibreChat's encryption key)
        CREDS_KEY: process.env.CREDS_KEY,
        // User context (LibreChat passes this)
        MCP_USER_ID: process.env.MCP_USER_ID // Phone number for SMS users
    };
    console.log('[LibreChat Integration] MCP Data Storage configured with:', {
        storageType: config.MCP_STORAGE_TYPE,
        database: config.MONGODB_DATABASE,
        hasEncryptionKey: !!config.CREDS_KEY,
        userId: config.MCP_USER_ID ? 'provided' : 'not provided'
    });
    return config;
}
// Example 5: Complete MCP Server with Sizzek Storage
export class LibreChatCompatibleMCPServer {
    memory;
    credentials;
    todos;
    userId;
    constructor() {
        this.memory = new SMSMemoryManager();
        this.credentials = new SMSCredentialsManager();
        this.todos = new SMSTodoManager();
        // Get user ID from environment (LibreChat passes phone number)
        this.userId = process.env.MCP_USER_ID || 'default_user';
        console.log(`[MCP Server] Initialized for user: ${this.userId}`);
    }
    // MCP tool: Remember a fact
    async tool_remember_fact(params) {
        await this.memory.rememberFact(this.userId, params.fact, params.entity);
        return { success: true, message: `Remembered: ${params.fact}` };
    }
    // MCP tool: Recall facts
    async tool_recall_facts(params) {
        if (params.entity) {
            const facts = await this.memory.getFactsAbout(this.userId, params.entity);
            return { facts, entity: params.entity };
        }
        else {
            const allMemories = await this.memory.getAllMemories(this.userId);
            return { memories: allMemories };
        }
    }
    // MCP tool: Add todo
    async tool_add_todo(params) {
        const todoId = await this.todos.addTodo(this.userId, params.text, params.dueDate);
        return { success: true, todoId, message: `Added todo: ${params.text}` };
    }
    // MCP tool: List todos
    async tool_list_todos() {
        const todos = await this.todos.getTodos(this.userId);
        return { todos, count: todos.length };
    }
    // MCP tool: Check if user has Google Calendar access
    async tool_check_google_calendar() {
        const hasCredentials = await this.credentials.hasCredentials(this.userId);
        return {
            hasAccess: hasCredentials,
            message: hasCredentials
                ? 'Google Calendar access is configured'
                : 'Google Calendar access not configured. Please complete OAuth flow.'
        };
    }
}
// Export utility function for easy LibreChat integration
export function createSMSStorageManagers() {
    return {
        memory: new SMSMemoryManager(),
        credentials: new SMSCredentialsManager(),
        todos: new SMSTodoManager()
    };
}
//# sourceMappingURL=librechat-integration.js.map