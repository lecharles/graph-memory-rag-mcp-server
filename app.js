import { Server } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/transport.js";
import { z } from "zod";

// In-memory graph database
const graphDb = {
  entities: new Map(),
  relationships: new Map()
};

// Helper function to validate required fields
function validateFields(data, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Helper function for logging
function log(action, data) {
  console.log(`[${action}]`, JSON.stringify(data, null, 2));
}

// Helper function for error handling
function handleError(action, error, params = {}) {
  console.error(`[${action} Error]`, error.message, params);
  throw error;
}

// Create server instance
const server = new Server({
  name: "graph-memory",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {
      listChanged: true
    }
  }
});

// Helper function to generate unique IDs
function generateId() {
  return Math.random().toString(36).substring(2);
}

// Create entity tool
server.tool(
  "create_entity",
  "Create a new entity in the graph",
  {
    name: z.string().describe("Name of the entity"),
    entityType: z.string().describe("Type of the entity"),
    observations: z.array(z.string()).describe("Initial observations about the entity")
  },
  async ({ name, entityType, observations }) => {
    const id = generateId();
    const entity = {
      id,
      name,
      type: entityType,
      observations: observations || []
    };
    graphDb.entities.set(id, entity);
    
    return {
      content: [{ 
        type: "text", 
        text: `Created entity ${name} with ID ${id}` 
      }]
    };
  }
);

// Create relationship tool
server.tool(
  "create_relationship",
  "Create a relationship between two entities",
  {
    fromEntityName: z.string().describe("Name of the source entity"),
    toEntityName: z.string().describe("Name of the target entity"),
    relationType: z.string().describe("Type of the relationship")
  },
  async ({ fromEntityName, toEntityName, relationType }) => {
    // Find entities by name
    const fromEntity = Array.from(graphDb.entities.values())
      .find(e => e.name === fromEntityName);
    const toEntity = Array.from(graphDb.entities.values())
      .find(e => e.name === toEntityName);

    if (!fromEntity || !toEntity) {
      return {
        content: [{ 
          type: "text", 
          text: "One or both entities not found" 
        }],
        isError: true
      };
    }

    const id = generateId();
    const relationship = {
      id,
      fromId: fromEntity.id,
      toId: toEntity.id,
      type: relationType
    };
    graphDb.relationships.set(id, relationship);

    return {
      content: [{ 
        type: "text", 
        text: `Created relationship ${relationType} from ${fromEntityName} to ${toEntityName}` 
      }]
    };
  }
);

// Query entities tool
server.tool(
  "query_entities",
  "Query entities by type",
  {
    entityType: z.string().describe("Type of entities to query")
  },
  async ({ entityType }) => {
    const entities = Array.from(graphDb.entities.values())
      .filter(e => e.type === entityType);

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(entities, null, 2) 
      }]
    };
  }
);

// Query relationships tool
server.tool(
  "query_relationships",
  "Query relationships by type",
  {
    relationType: z.string().describe("Type of relationships to query")
  },
  async ({ relationType }) => {
    const relationships = Array.from(graphDb.relationships.values())
      .filter(r => r.type === relationType)
      .map(r => {
        const fromEntity = graphDb.entities.get(r.fromId);
        const toEntity = graphDb.entities.get(r.toId);
        return {
          ...r,
          fromEntity: fromEntity?.name,
          toEntity: toEntity?.name
        };
      });

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(relationships, null, 2) 
      }]
    };
  }
);

// Delete entity tool
server.tool(
  "delete_entity",
  "Delete an entity and its relationships",
  {
    name: z.string().describe("Name of the entity to delete")
  },
  async ({ name }) => {
    const entity = Array.from(graphDb.entities.values())
      .find(e => e.name === name);

    if (!entity) {
      return {
        content: [{ 
          type: "text", 
          text: "Entity not found" 
        }],
        isError: true
      };
    }

    // Delete relationships involving this entity
    for (const [id, rel] of graphDb.relationships.entries()) {
      if (rel.fromId === entity.id || rel.toId === entity.id) {
        graphDb.relationships.delete(id);
      }
    }

    // Delete the entity
    graphDb.entities.delete(entity.id);

    return {
      content: [{ 
        type: "text", 
        text: `Deleted entity ${name} and its relationships` 
      }]
    };
  }
);

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);