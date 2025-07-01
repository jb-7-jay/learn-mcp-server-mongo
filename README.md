# MongoDB MCP Server

A robust Model Context Protocol (MCP) server that provides tools and prompts for interacting with a MongoDB database. Built with Node.js and MongoDB, featuring graceful shutdown handling and comprehensive error management.

## Features

- MongoDB integration using Mongoose
- User management tools:
  - `create-user`: Create a new user
  - `get-user`: Retrieve user by email
  - `list-users`: List all users with pagination
- Interactive prompts for guided operations
- Graceful shutdown handling
- Comprehensive error management
- Clean single-file implementation

## Prerequisites

- Node.js (Latest LTS version)
- MongoDB (v8.0 or higher)
- Claude for Desktop (latest version)
- Visual Studio Code with Cursor extension (for development)

## Development Setup

1. Install MongoDB:
   ```bash
   # Using Homebrew on macOS
   brew tap mongodb/brew
   brew install mongodb-community

   # Start MongoDB service
   brew services start mongodb-community
   ```

2. Install Cursor in VS Code:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Cursor"
   - Click Install

3. Clone and Setup:
   ```bash
   git clone <repository-url>
   cd learn-mcp-mongo
   npm install
   ```

4. Configure Environment:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI if different from default
   ```

## Quick Start

1. Clone or download this repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure MongoDB:
   - Make sure MongoDB is running locally (default: mongodb://localhost:27017)
   - Or update the `.env` file with your MongoDB connection string:
     ```
     MONGODB_URI=your_mongodb_connection_string
     ```

4. Configure Claude for Desktop:
   - Open or create `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Add the following configuration:
     ```json
     {
       "mcpServers": {
         "mcp-mongo": {
           "command": "node",
           "args": ["/absolute/path/to/server.js"]
         }
       }
     }
     ```

5. Start Claude for Desktop
   - The MCP server will start automatically
   - Look for the "Search and tools" icon to access the tools

## Using Cursor with MCP Server

1. **Install Cursor (AI Code Editor):**
   - Download from [https://www.cursor.so/](https://www.cursor.so/)
   - Install and open Cursor on your machine

2. **Add MCP Server to Cursor:**
   - Open Cursor
   - Go to `Settings` > `Integrations` > `MCP Servers`
   - Click `Add MCP Server`
   - Fill in:
     - **Name:** mcp-mongo
     - **Command:** node
     - **Arguments:** /absolute/path/to/server.js
     - **Working Directory:** /absolute/path/to/learn-mcp-mongo
   - Save and enable the integration

3. **Use Cursor's AI Features:**
   - Open your project folder in Cursor
   - Use `/help` in the command palette for available AI commands
   - Use `/edit`, `/fix`, `/doc`, and other AI features to interact with your code and MCP tools
   - You can now test, debug, and develop your MCP server directly in Cursor with AI assistance

## Usage Examples

### Creating a User
```
Create a new user with:
- name: "John Doe"
- email: "john@example.com"
- age: 30
```

### Finding a User
```
Get user information for email: john@example.com
```

## Project Structure

```
learn-mcp-mongo/
├── server.js     # Main server file with all functionality
├── .env          # Environment variables
└── package.json  # Project dependencies and scripts
```

## Available Tools

### create-user
Creates a new user in the database.
- Parameters:
  - name: User's full name (string, required)
  - email: User's email address (string, required, unique)
  - age: User's age (number, required)
- Response:
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "createdAt": "2025-06-26T00:00:00.000Z"
  }
  ```

### get-user
Retrieves a user by their email address.
- Parameters:
  - email: User's email address (string, required)
- Response:
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "createdAt": "2025-06-26T00:00:00.000Z"
  }
  ```

### list-users
Lists all users in the database with pagination.
- Parameters:
  - limit: Maximum number of users to return (number, optional, default: 10)
- Response:
  ```json
  [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "createdAt": "2025-06-26T00:00:00.000Z"
    },
    // ... more users
  ]
  ```

## Available Prompts

### create-new-user
An interactive prompt that guides you through the process of creating a new user by asking for:
1. Full Name
2. Email Address
3. Age

## Development Guide

### Running the Server

1. Start in Development Mode:
   ```bash
   # Run with inspector for debugging
   npx @modelcontextprotocol/inspector node mcp-server.js

   # Or run directly
   npm start
   ```

2. Using Cursor in VS Code:
   - Open the project in VS Code
   - Use Cursor's AI features:
     - Type `/help` for Cursor commands
     - Use `/edit` for code suggestions
     - Use `/doc` to generate documentation
     - Use `/fix` to get error fixes

### Debugging

1. Check Server Logs:
   ```bash
   # Watch server logs in real-time
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

2. MongoDB Operations:
   ```bash
   # Check MongoDB status
   mongosh
   use mcp-mongo
   db.users.find()  # List all users
   ```

3. Test Tools Manually:
   ```bash
   # Using curl to test tools (when running in HTTP mode)
   curl -X POST http://localhost:3000/tools/list-users
   ```

### Server Features

1. Graceful Shutdown:
   - Handles SIGINT, SIGTERM, SIGHUP signals
   - Closes MongoDB connections properly
   - Logs shutdown process

2. Error Handling:
   - MongoDB connection errors
   - Tool execution errors
   - Uncaught exceptions
   - Unhandled rejections

3. Performance Options:
   - MongoDB connection timeout: 5s
   - Heartbeat frequency: 2s
   - User listing pagination

## Troubleshooting

1. Make sure MongoDB is running and accessible
2. Check Claude for Desktop logs at `~/Library/Logs/Claude/mcp*.log`
3. Verify the server.js path in claude_desktop_config.json is correct
4. Restart Claude for Desktop after configuration changes
