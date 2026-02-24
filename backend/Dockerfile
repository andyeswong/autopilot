# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/interfaces/api/main"]
