# Use the Node.js LTS version image as the base image
FROM node:lts

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --quiet

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the application runs
EXPOSE 4000

# Start the application
CMD ["node", "server.js"]
