# === STAGE 1: Build Stage ===
FROM node:22-alpine AS builder
WORKDIR /app

# 1. Tanggapin ang Build Arguments mula sa Docker Compose
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

# 2. Gawing available sa build environment ng Vite
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

COPY package*.json ./
RUN npm config set fetch-retries 5 && \
    npm install --legacy-peer-deps

COPY . .
RUN npm run build

# === STAGE 2: Production Stage ===
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]