# MongoDB MCP Server

A simple Model Context Protocol (MCP) server that provides tools and prompts for interacting with a MongoDB database. Built with Node.js and MongoDB.

## Features

- MongoDB integration using Mongoose
- User management tools:
  - `create-user`: Create a new user
  - `get-user`: Retrieve user by email
- Interactive prompts to guide user operations
- Simple and clean single-file implementation

## Prerequisites

- Node.js (Latest LTS version)
- MongoDB (running locally or accessible via URL)
- Claude for Desktop (for testing)

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
  - name: User's full name (string)
  - email: User's email address (string)
  - age: User's age (number)

### get-user
Retrieves a user by their email address.
- Parameters:
  - email: User's email address (string)

## Available Prompts

### create-new-user
An interactive prompt that guides you through the process of creating a new user by asking for:
1. Full Name
2. Email Address
3. Age

## Development

To inspect the MCP server during development:
```bash
npx @modelcontextprotocol/inspector node server.js
```

## Troubleshooting

1. Make sure MongoDB is running and accessible
2. Check Claude for Desktop logs at `~/Library/Logs/Claude/mcp*.log`
3. Verify the server.js path in claude_desktop_config.json is correct
4. Restart Claude for Desktop after configuration changes
