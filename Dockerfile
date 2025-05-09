# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy remaining source
COPY . .

# Build the TypeScript project
RUN npm run build

# Set default environment variables (can be overridden at runtime)
ENV GOOGLE_CHAT_SPACE_ID=dummy_space_id
ENV GOOGLE_CHAT_API_KEY=dummy_api_key
ENV GOOGLE_CHAT_TOKEN=dummy_token

# Start the MCP server
CMD ["node", "build/index.js"]
