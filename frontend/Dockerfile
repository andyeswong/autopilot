# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Vite bakes these env vars into the bundle at build time.
ARG VITE_API_URL=http://localhost:3000
ARG VITE_VNC_URL=http://localhost:6080
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_VNC_URL=$VITE_VNC_URL

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Serve Stage ----
FROM node:20-alpine

RUN npm install -g serve

COPY --from=builder /app/dist /app/dist
WORKDIR /app

EXPOSE 3000

# 'serve' reads the PORT env var automatically via -l flag; Railway sets PORT at runtime
CMD ["sh", "-c", "serve dist -l ${PORT:-3000} --single"]
