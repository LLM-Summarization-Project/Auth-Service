# ============================
# 1) Build Stage
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json* ./

# Install ALL deps (dev + prod)
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy all source code
COPY . .

# Build using TypeScript
RUN npm run build

# ============================
# 2) Runner Stage
# ============================
FROM node:20-alpine AS runner

WORKDIR /app

# Copy everything needed from builder
COPY --from=builder /app/package.json ./

# Copy the entire node_modules from builder
# This includes the correctly generated Prisma client and all prod dependencies
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]