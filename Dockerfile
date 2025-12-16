# ============================
# 1) Build Stage
# ============================
FROM node:20-alpine AS builder
WORKDIR /app

# Install npm deps (use npm for consistent node_modules layout)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# ============================
# 2) Runner Stage
# ============================
FROM node:20-alpine AS runner
WORKDIR /app

# Install only production deps in runner
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy built app + prisma + prisma-client artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 4000
CMD ["node", "dist/main.js"]
