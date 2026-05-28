# Stage 1: フロントエンドビルド
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json ./
COPY packages/frontend/package.json ./packages/frontend/
RUN npm install -w packages/frontend
COPY packages/frontend ./packages/frontend
RUN npm run build -w packages/frontend

# Stage 2: バックエンドビルド
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package.json ./
COPY packages/backend/package.json ./packages/backend/
RUN npm install -w packages/backend
COPY packages/backend ./packages/backend
RUN npm run build -w packages/backend

# Stage 3: 本番イメージ
FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY packages/backend/package.json ./packages/backend/
RUN npm install -w packages/backend --omit=dev

COPY --from=backend-builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=frontend-builder /app/packages/frontend/dist ./packages/frontend/dist

RUN mkdir -p /app/packages/backend/data

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "packages/backend/dist/index.js"]
