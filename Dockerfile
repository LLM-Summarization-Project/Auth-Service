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
RUN npx prisma generate

# Copy all source code
COPY . .

# Build using TypeScript
RUN pnpm run build


# ============================
# 2) Runner Stage
# ============================
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# Install ONLY production deps
RUN pnpm install --frozen-lockfile --prod

# Copy build output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/main.js"]
