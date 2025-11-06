# Dockerfile for Next.js

# -----------------
# 1. DEPENDENCIES
# -----------------
# Install dependencies in a separate stage to leverage Docker's layer caching.
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock, etc.)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# -----------------
# 2. BUILD
# -----------------
# Build the Next.js application in a separate stage.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# This will create the .next folder with the production build
RUN npm run build

# -----------------
# 3. RUNNER
# -----------------
# Create the final, small production image.
FROM node:20-alpine AS runner
WORKDIR /app

# Install necessary runtime dependencies for Next.js standalone mode
RUN apk add --no-cache libc6-compat

# Set the environment to production
ENV NODE_ENV=production

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# Copy the Next.js standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# The standalone output includes its own minimal node_modules,
# so we don't need to copy the full node_modules from the deps stage.

# EXPOSE port
EXPOSE 9002

# The CMD instruction starts the application.
CMD ["node", "server.js"]
