# Graph Memory RAG MCP Server

A Model Context Protocol (MCP) server implementation that provides graph-based memory storage capabilities. This server allows AI agents to store and retrieve information in a graph structure, making it ideal for maintaining context and relationships between different pieces of information.

## Features

- In-memory graph database storage
- Entity creation and management
- Relationship creation between entities
- Query capabilities for both entities and relationships
- Delete operations with cascading relationship cleanup
- MCP-compliant interface

## Installation

```bash
npm install
```

## Dependencies

- @modelcontextprotocol/sdk: ^1.0.3
- zod: ^3.22.4

## Usage

Start the server:

```bash
node app.js
```

## API Tools

### Create Entity
Creates a new entity in the graph database.
- Parameters:
  - name: string
  - entityType: string
  - observations: string[]

### Create Relationship
Creates a relationship between two existing entities.
- Parameters:
  - fromEntityName: string
  - toEntityName: string
  - relationType: string

### Query Entities
Retrieves entities by type.
- Parameters:
  - entityType: string

### Query Relationships
Retrieves relationships by type.
- Parameters:
  - relationType: string

### Delete Entity
Deletes an entity and its associated relationships.
- Parameters:
  - name: string

## Implementation Details

The server uses an in-memory graph database with two main components:
1. Entities Map: Stores entity objects with their properties
2. Relationships Map: Stores relationship objects connecting entities

Each entity contains:
- id: Unique identifier
- name: Entity name
- type: Entity type
- observations: Array of strings containing information about the entity

Each relationship contains:
- id: Unique identifier
- fromId: Source entity ID
- toId: Target entity ID
- type: Relationship type

## Contributing

Feel free to open issues or submit pull requests for improvements.

## License

MIT