#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

class GoogleChatServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: "google-chat-server", version: "0.1.0" },
      { capabilities: { tools: {} } }
    );

    this.setupToolHandlers();

    this.server.onerror = (error: Error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  // Define the tool: post_text_message.
  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "post_text_message",
          description:
            "Post a text message to a Google Chat space via a provided space_id, key and token.",
          inputSchema: {
            type: "object",
            properties: {
              space_id: {
                type: "string",
                description: "The ID of the Google Chat space.",
              },
              key: {
                type: "string",
                description: "The API key for Google Chat.",
              },
              token: {
                type: "string",
                description: "The token for Google Chat.",
              },
              text: {
                type: "string",
                description: "The text content of the message to be posted.",
              },
            },
            required: ["space_id", "key", "token", "text"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const args = request.params.arguments;
      switch (toolName) {
        case "post_text_message":
          return await this.handlePostTextMessage(args);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${toolName}`
          );
      }
    });
  }

  // Tool: Post a text message via webhook.
  private async handlePostTextMessage(args: any): Promise<any> {
    try {
      const { space_id, key, token, text } = args;
      const payload = { text };

      // Log the values for debugging
      console.log("space_id:", space_id);
      console.log("key:", key);
      console.log("token:", token);
      console.log("text:", text);

      // Send the message via a POST request.
      const response = await fetch(
        `https://chat.googleapis.com/v1/spaces/${space_id}/messages?key=${key}&token=${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const responseData = await response.json();
      return {
        content: [
          {
            type: "text",
            text: `Message posted successfully. Response: ${JSON.stringify(
              responseData
            )}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error posting message: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Run the MCP server using stdio transport.
  public async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Google Chat MCP server running on stdio");
  }
}

const server = new GoogleChatServer();
server.run().catch(console.error);