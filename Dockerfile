FROM node:18-bullseye-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm ci

COPY src/ ./src/

RUN npm run build

FROM node:18-bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g @openai/codex

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN useradd --create-home --shell /bin/bash --user-group --uid 1001 appuser

RUN chown -R appuser:appuser /app

USER appuser

RUN codex --version

RUN mkdir -p /home/appuser/.codex

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

CMD ["npm", "start"]
