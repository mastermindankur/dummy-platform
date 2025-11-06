# Use the official Node.js 20 image as a base
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker's caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Expose the port the app runs on
EXPOSE 9002

# The command to start the app
CMD ["npm", "start"]
