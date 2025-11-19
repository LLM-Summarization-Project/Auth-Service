FROM node:20-alpine as builder

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile
RUN npx prisma generate

COPY . .
RUN pnpm run build

FROM node:20-alpine as runner
WORKDIR /app
RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/main.js"]
