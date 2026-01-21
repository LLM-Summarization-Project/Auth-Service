# ============================
# 1) Build Stage
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first (layer caching)
COPY package.json pnpm-lock.yaml ./

# Install ALL deps (dev + prod)
RUN pnpm install --frozen-lockfile --prod=false

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN pnpm exec prisma generate

# Copy all source code
COPY . .

# Build using TypeScript
RUN pnpm run build

# Prune dev dependencies (keep prod deps and generated client)
RUN pnpm prune --prod

# ============================
# 2) Runner Stage
# ============================
FROM node:20-alpine AS runner

WORKDIR /app

# Copy everything needed from builder
COPY --from=builder /app/package.json ./

# Copy the entire pruned node_modules from builder
# This includes the correctly generated Prisma client and all prod dependencies
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]