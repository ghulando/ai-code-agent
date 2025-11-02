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

COPY src/ ./src/

RUN useradd --create-home --shell /bin/bash --user-group --uid 1001 appuser

RUN chown -R appuser:appuser /app

USER appuser

RUN codex --version

RUN mkdir -p /home/appuser/.codex

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

CMD ["npm", "start"]
