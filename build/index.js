#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode, } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import * as dotenv from "dotenv";
import { join } from 'path';
dotenv.config({ path: join(process.cwd(), '.env') }); // Load environment variables from .env file
class GoogleChatServer {
    server;
    spaceId;
    apiKey;
    apiToken;
    constructor() {
        this.server = new Server({ name: "google-chat-server", version: "0.1.0" }, { capabilities: { tools: {} } });
        this.spaceId = process.env.GOOGLE_CHAT_SPACE_ID;
        this.apiKey = process.env.GOOGLE_CHAT_API_KEY;
        this.apiToken = process.env.GOOGLE_CHAT_TOKEN;
        if (!this.spaceId || !this.apiKey || !this.apiToken) {
            console.error("Error: GOOGLE_CHAT_SPACE_ID, GOOGLE_CHAT_API_KEY, and GOOGLE_CHAT_TOKEN must be set in .env");
            process.exit(1);
        }
        this.setupToolHandlers();
        this.server.onerror = (error) => console.error("[MCP Error]", error);
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "post_text_message",
                    description: "Post a text message to a Google Chat space.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            text: {
                                type: "string",
                                description: "The text content of the message to be posted.",
                            },
                        },
                        required: ["text"],
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
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
            }
        });
    }
    async handlePostTextMessage(args) {
        try {
            const { text } = args;
            const payload = { text };
            console.log("space_id:", this.spaceId);
            console.log("key:", this.apiKey);
            console.log("token:", this.apiToken);
            console.log("text:", text);
            const response = await fetch(`https://chat.googleapis.com/v1/spaces/${this.spaceId}/messages?key=${this.apiKey}&token=${this.apiToken}`, {
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
                        text: `Message posted successfully. Response: ${JSON.stringify(responseData)}`,
                    },
                ],
            };
        }
        catch (error) {
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
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Google Chat MCP server running on stdio");
    }
}
const server = new GoogleChatServer();
server.run().catch(console.error);
