/**
 * Example: LibreChat Integration with Sizzek MCP Data Storage
 *
 * This example shows how to use the Sizzek MCP Data storage system
 * with LibreChat for SMS user management and MCP servers.
 */
interface UserMemory {
    entities: Array<{
        name: string;
        type: string;
        observations: string[];
    }>;
    relations: Array<{
        from: string;
        to: string;
        type: string;
    }>;
}
export declare class SMSMemoryManager {
    private storage;
    constructor();
    rememberFact(phoneNumber: string, fact: string, entityName: string): Promise<void>;
    getFactsAbout(phoneNumber: string, entityName: string): Promise<string[]>;
    getAllMemories(phoneNumber: string): Promise<UserMemory>;
}
interface GoogleCredentials {
    clientId: string;
    clientSecret: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
}
export declare class SMSCredentialsManager {
    private storage;
    constructor();
    storeCredentials(phoneNumber: string, credentials: GoogleCredentials): Promise<void>;
    getCredentials(phoneNumber: string): Promise<GoogleCredentials | null>;
    hasCredentials(phoneNumber: string): Promise<boolean>;
    updateTokens(phoneNumber: string, accessToken: string, refreshToken?: string, expiresAt?: string): Promise<void>;
}
interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    dueDate?: string;
}
export declare class SMSTodoManager {
    private storage;
    constructor();
    addTodo(phoneNumber: string, text: string, dueDate?: string): Promise<string>;
    getTodos(phoneNumber: string, includeCompleted?: boolean): Promise<TodoItem[]>;
    completeTodo(phoneNumber: string, todoId: string): Promise<boolean>;
}
export declare function configureForLibreChat(): {
    MCP_STORAGE_TYPE: string;
    MONGODB_CONNECTION_STRING: string;
    MONGODB_DATABASE: string;
    CREDS_KEY: string | undefined;
    MCP_USER_ID: string | undefined;
};
export declare class LibreChatCompatibleMCPServer {
    private memory;
    private credentials;
    private todos;
    private userId;
    constructor();
    tool_remember_fact(params: {
        fact: string;
        entity: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    tool_recall_facts(params: {
        entity?: string;
    }): Promise<{
        facts: string[];
        entity: string;
        memories?: undefined;
    } | {
        memories: UserMemory;
        facts?: undefined;
        entity?: undefined;
    }>;
    tool_add_todo(params: {
        text: string;
        dueDate?: string;
    }): Promise<{
        success: boolean;
        todoId: string;
        message: string;
    }>;
    tool_list_todos(): Promise<{
        todos: TodoItem[];
        count: number;
    }>;
    tool_check_google_calendar(): Promise<{
        hasAccess: boolean;
        message: string;
    }>;
}
export declare function createSMSStorageManagers(): {
    memory: SMSMemoryManager;
    credentials: SMSCredentialsManager;
    todos: SMSTodoManager;
};
export {};
//# sourceMappingURL=librechat-integration.d.ts.map