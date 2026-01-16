# FPanel Dockerfile
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    python3 \
    python3-pip \
    sqlite3 \
    certbot \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL=/root/.bun
ENV PATH="$BUN_INSTALL/bin:$PATH"

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application files
COPY . .

# Generate Prisma Client
RUN bun run db:generate

# Build application
RUN bun run build

# Create necessary directories
RUN mkdir -p db upload logs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start application
CMD ["bun", "run", "start"]
