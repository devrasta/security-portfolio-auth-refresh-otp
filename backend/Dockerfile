# =========================================
# Stage 1: Build the NestJS Application
# =========================================
ARG NODE_VERSION=20.19.6
ARG NGINX_VERSION=alpine3.22

FROM node:${NODE_VERSION}-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN --mount=type=cache,target=/root/.yarn yarn install --frozen-lockfile

# Copy source code first (needed for prisma generate with custom output path)
COPY . .

# Generate Prisma Client (will create src/modules/prisma/generated)
RUN npx prisma generate

# Create index.ts for Prisma generated client exports
RUN echo "/* Generated index file */" > src/modules/prisma/generated/index.ts && \
    echo "export * from './client';" >> src/modules/prisma/generated/index.ts && \
    echo "export * from './models';" >> src/modules/prisma/generated/index.ts

# Debug: Verify Prisma generated files exist
RUN echo "=== Checking Prisma generated files ===" && \
    ls -la src/modules/prisma/generated/ && \
    cat src/modules/prisma/generated/index.ts

# Build the NestJS application with verbose output
RUN set -x && yarn build

# Verify the build output
RUN ls -la dist/ && test -f dist/main.js || (echo "Error: dist/main.js not found!" && ls -R dist/ && exit 1)

# =========================================
# Stage 2: Production Dependencies
# =========================================
FROM node:${NODE_VERSION}-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./

# Install only production dependencies
RUN --mount=type=cache,target=/root/.yarn yarn install --production --frozen-lockfile

# =========================================
# Stage 3: Run with Nginx as Reverse Proxy
# =========================================
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Create necessary directories and set permissions for node user
RUN mkdir -p /var/log/nginx /var/lib/nginx /run/nginx && \
    chown -R node:node /var/log/nginx /var/lib/nginx /run/nginx /app

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Switch to node user
USER node

# Expose port 4001
EXPOSE 4001

# Start both NestJS and Nginx
CMD sh -c "node dist/main.js & nginx -g 'daemon off;'"
