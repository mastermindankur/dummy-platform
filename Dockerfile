# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# The command to run the application
CMD ["npm", "start"]
