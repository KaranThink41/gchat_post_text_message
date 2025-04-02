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
            "Post a text message to a Google Chat space via a provided webhook URL.",
          inputSchema: {
            type: "object",
            properties: {
              webhook: {
                type: "string",
                description:
                  "The full Google Chat webhook URL (e.g., https://chat.googleapis.com/v1/spaces/AAAA.../messages?key=YOUR_KEY&token=YOUR_TOKEN).",
              },
              text: {
                type: "string",
                description: "The text content of the message to be posted.",
              },
            },
            required: ["webhook", "text"],
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
      const { webhook, text } = args;
      if (!webhook) {
        throw new Error("Webhook URL is required.");
      }
      const payload = { text };

      // Send the message via a POST request.
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
