# Stage 1: Install dependencies only when needed
FROM node:18-alpine3.15 AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the app with cached dependencies
FROM node:18-alpine3.15 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine3.15 AS runner

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --production

# Copy the built application
COPY --from=builder /app/dist ./dist

# Uncomment the following lines if you need to copy additional files or set up permissions
# RUN mkdir -p ./pokedex
# COPY --from=builder /app/dist/ ./app
# COPY ./.env ./app/.env
# RUN adduser --disabled-password pokeuser
# RUN chown -R pokeuser:pokeuser ./pokedex
# USER pokeuser

# Expose the necessary port if your application uses it (uncomment if needed)
# EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
