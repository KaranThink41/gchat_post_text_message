# Google Chat MCP Server

A Model Context Protocol (MCP) server implementation for interacting with Google Chat API via webhooks. This server provides a simple tool for posting text messages to Google Chat spaces.

## Features

- Post text messages to Google Chat spaces using webhooks
- Simple and secure webhook-based integration
- No OAuth setup required
- Easy to use with MCP-compatible tools

## Installation

### Using Smithery (Recommended)

Install the server using Smithery's CLI:

```bash
npx spinai-mcp install @KaranThink41/google_chat_mcp_server --provider smithery
```

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/KaranThink41/google_chat_mcp_server.git
cd google_chat_mcp_server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run the server:
```bash
node build/index.js
```

## Usage Example

To post a message to Google Chat:

```json
{
  "method": "tools/call",
  "params": {
    "name": "post_text_message",
    "arguments": {
      "webhook": "https://chat.googleapis.com/v1/spaces/AAAA.../messages?key=YOUR_KEY&token=YOUR_TOKEN",
      "text": "Hello, this is a test message!"
    }
  }
}
```

## Configuration

The server requires a webhook URL to function. You can obtain this URL by:

1. Going to your Google Chat space
2. Clicking on the three dots (...) in the top-right corner
3. Selecting "Get webhook URL"
4. Copying the provided URL

## Security

- Webhook URLs are passed directly in the request payload
- No sensitive credentials are stored in the code
- All requests are validated before execution

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.