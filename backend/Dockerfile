# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Production environment
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Install PM2 globally
RUN npm install -g pm2

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy the PM2 ecosystem file
COPY ecosystem.config.cjs ./

# Ensure logs directory exists for PM2
RUN mkdir -p logs

# Expose the API port
EXPOSE 4000

# Set environment to production (can be overridden by docker run / compose)
ENV NODE_ENV=production

# Start the application using PM2 runtime (keeps container alive)
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
