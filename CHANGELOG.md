# Changelog

All notable changes to the @sizzek/mcp-data package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-24

### Added
- **Initial Release** of @sizzek/mcp-data package
- **StorageInterface** - Universal storage abstraction layer
- **JsonStorage** - File-based storage implementation with encryption
- **MongodbStorage** - Production MongoDB backend with user isolation
- **PaginatedGraphStorage** - Advanced graph storage for knowledge management
- **StorageFactory** - Configuration-based storage instance creation
- **LibreChat Integration** - Complete example for LibreChat MCP integration
- **User Isolation** - Multi-tenant data scoping and security
- **Encryption Support** - Built-in encryption for sensitive data
- **TypeScript Support** - Full type definitions and strict typing
- **Comprehensive Documentation** - Complete API docs and usage examples

### Features
- Multi-backend storage abstraction (JSON, MongoDB)
- Enterprise-grade security with user isolation
- Graph-based knowledge storage with semantic search
- Pagination and filtering capabilities
- Connection pooling and error handling
- Configurable encryption for PII protection
- LibreChat MCP host compatibility
- Production-ready with comprehensive logging

### Security
- Multi-tenant isolation enforced at storage layer
- Input validation and sanitization
- Encryption at rest for sensitive fields
- Secure connection management
- Rate limiting and resource protection

### Performance
- Optimized MongoDB queries with proper indexing
- Memory-efficient graph traversal
- Connection pooling for database backends
- Lazy loading and pagination support

---

## Versioning Strategy

- **Major versions** (x.0.0): Breaking API changes
- **Minor versions** (0.x.0): New features, backward compatible
- **Patch versions** (0.0.x): Bug fixes, security updates

## Migration Guides

### From Legacy Storage
For users migrating from custom storage implementations:
1. Install `@sizzek/mcp-data`
2. Replace storage imports with package imports
3. Update configuration to use StorageFactory
4. Test with existing data to ensure compatibility

## Support

- **Documentation**: [GitHub Repository](https://github.com/sizzek/mcp-data)
- **Issues**: [GitHub Issues](https://github.com/sizzek/mcp-data/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sizzek/mcp-data/discussions) 