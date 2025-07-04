
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-mongo';

// Global variables to track server state
let server = null;
let transport = null;
let isShuttingDown = false;

// Define the User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB with proper error handling
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      heartbeatFrequencyMS: 2000, // Check connection every 2s
    });
    console.error('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Graceful shutdown function
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.error('⚠️  Already shutting down, forcing exit...');
    process.exit(1);
  }
  
  isShuttingDown = true;
  console.error(`🛑 Received ${signal}, shutting down gracefully...`);
  
  try {
    // Close MCP server connection
    if (transport) {
      console.error('🔌 Closing MCP transport...');
      await transport.close();
    }
    
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      console.error('🗄️  Closing MongoDB connection...');
      await mongoose.connection.close();
      console.error('✅ MongoDB connection closed');
    }
    
    console.error('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Set up signal handlers for graceful shutdown
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start MCP Server
async function main() {
  try {
    await connectDB();

    server = new Server(
      {
        name: "mcp-mongo",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: { listChanged: true },
          prompts: { listChanged: true },
        },
      }
    );

    // Handle tool listing
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "create-user",
            description: "Create a new user in the database",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "User's full name"
                },
                email: {
                  type: "string",
                  description: "User's email address"
                },
                age: {
                  type: "number",
                  description: "User's age"
                }
              },
              required: ["name", "email", "age"]
            }
          },
          {
            name: "get-user",
            description: "Retrieve a user by email address",
            inputSchema: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  description: "User's email address"
                }
              },
              required: ["email"]
            }
          },
          {
            name: "list-users",
            description: "List all users in the database",
            inputSchema: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Maximum number of users to return (default: 10)"
                }
              }
            }
          }
        ]
      };
    });

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Check if we're shutting down
      if (isShuttingDown) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Server is shutting down, cannot process request"
            }
          ],
          isError: true
        };
      }

      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case "create-user": {
            const { name: userName, email, age } = args;
            const user = new User({ name: userName, email, age });
            await user.save();
            return {
              content: [
                {
                  type: "text",
                  text: `✅ User created successfully!\n\n${JSON.stringify(user.toObject(), null, 2)}`
                }
              ]
            };
          }
          
          case "get-user": {
            const { email } = args;
            const user = await User.findOne({ email });
            if (!user) {
              return {
                content: [
                  {
                    type: "text",
                    text: `❌ User with email "${email}" not found.`
                  }
                ]
              };
            }
            return {
              content: [
                {
                  type: "text",
                  text: `👤 User found:\n\n${JSON.stringify(user.toObject(), null, 2)}`
                }
              ]
            };
          }
          
          case "list-users": {
            const { limit = 10 } = args;
            const users = await User.find().limit(limit).sort({ createdAt: -1 });
            return {
              content: [
                {
                  type: "text",
                  text: `📋 Found ${users.length} users:\n\n${JSON.stringify(users.map(u => u.toObject()), null, 2)}`
                }
              ]
            };
          }
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    });

    // Handle prompt listing
    server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "create-new-user",
            description: "Interactive prompt to create a new user"
          },
          {
            name: "find-user-by-email",
            description: "Interactive prompt to find a user by email"
          }
        ]
      };
    });

    // Handle prompt requests
    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name } = request.params;
      
      switch (name) {
        case "create-new-user":
          return {
            description: "Create a new user in the database",
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Let's create a new user! Please provide the following details:

1. **Full Name** (required)
2. **Email Address** (required, must be unique)
3. **Age** (required, must be a number)

I'll help you add this user to the MongoDB database.`
                }
              }
            ]
          };
          
        case "find-user-by-email":
          return {
            description: "Look up a user by email address",
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Please provide the email address of the user you'd like to find in the database."
                }
              }
            ]
          };
          
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });

    // Connect to stdin/stdout transport
    transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("🚀 MCP MongoDB Server is running and ready to accept connections!");
    
    // Keep the process alive
    process.stdin.resume();
    
  } catch (error) {
    console.error("❌ Fatal error starting server:", error);
    await gracefulShutdown('startup-error');
  }
}

// Start the server
main().catch(async (error) => {
  console.error("❌ Fatal error in main:", error);
  await gracefulShutdown('main-error');
});