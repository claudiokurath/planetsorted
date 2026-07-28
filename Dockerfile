FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]
