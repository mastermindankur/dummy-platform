
# Stage 1: Builder
# This stage installs dependencies and builds the Next.js app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Runner
# This stage creates the final, lean image for production
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# Install libc6-compat which is required for Next.js on Alpine
RUN apk add --no-cache libc6-compat

# Copy the Next.js standalone output from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static


# The Next.js app in standalone mode runs on port 3000 by default.
# We'll expose it and set the PORT environment variable.
EXPOSE 9002
ENV PORT=9002

# Start the app
CMD ["node", "server.js"]
