/**
 * Paginated Graph Storage Implementation
 * Stores entities and relations as individual documents for scalability
 */
import { UserStorageInterface, StorageHealthInterface, StorageStats } from './StorageInterface.js';
export interface Entity {
    entityId: string;
    name: string;
    entityType: string;
    observations: string[];
    metadata?: {
        createdAt: Date;
        updatedAt: Date;
        relationCount?: number;
        source?: string;
    };
    tags?: string[];
    searchText?: string;
}
export interface Relation {
    relationId: string;
    fromEntityId: string;
    toEntityId: string;
    relationType: string;
    strength?: number;
    metadata?: {
        createdAt: Date;
        source?: string;
        confidence?: number;
    };
}
export interface KnowledgeGraph {
    entities: Entity[];
    relations: Relation[];
}
export interface GraphSummary {
    totalEntities: number;
    totalRelations: number;
    entityTypes: Record<string, number>;
    recentEntities: string[];
    searchIndex: {
        frequent_terms: string[];
        entity_names: string[];
    };
    updatedAt: Date;
}
export declare class PaginatedGraphStorage implements UserStorageInterface<KnowledgeGraph>, StorageHealthInterface {
    private client;
    private db;
    private entitiesCollection;
    private relationsCollection;
    private indexCollection;
    private isConnected;
    constructor(connectionString: string, databaseName?: string, collectionPrefix?: string);
    connect(): Promise<void>;
    private createIndexes;
    saveEntity(userId: string, entity: Entity): Promise<void>;
    getEntity(userId: string, entityId: string): Promise<Entity | null>;
    searchEntities(userId: string, query: string, limit?: number): Promise<Entity[]>;
    deleteEntity(userId: string, entityId: string): Promise<void>;
    saveRelation(userId: string, relation: Relation): Promise<void>;
    getRelations(userId: string, entityId: string): Promise<Relation[]>;
    deleteRelation(userId: string, fromEntityId: string, toEntityId: string): Promise<void>;
    saveEntitiesBatch(userId: string, entities: Entity[]): Promise<void>;
    getEntitiesBatch(userId: string, entityIds: string[]): Promise<Entity[]>;
    getConnectedEntities(userId: string, entityId: string, depth?: number): Promise<KnowledgeGraph>;
    getUserSummary(userId: string): Promise<GraphSummary>;
    saveForUser(userId: string, graph: KnowledgeGraph): Promise<void>;
    loadForUser(userId: string): Promise<KnowledgeGraph>;
    existsForUser(userId: string): Promise<boolean>;
    clearForUser(userId: string): Promise<void>;
    listUsers(): Promise<string[]>;
    save(data: KnowledgeGraph): Promise<void>;
    load(): Promise<KnowledgeGraph>;
    exists(): Promise<boolean>;
    clear(): Promise<void>;
    healthCheck(): Promise<boolean>;
    getStats(): Promise<StorageStats>;
    cleanup(): Promise<void>;
    private generateSearchText;
    private generateRelationId;
    private documentToEntity;
    private documentToRelation;
    private updateSummaryIndex;
    private generateSummary;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=PaginatedGraphStorage.d.ts.map