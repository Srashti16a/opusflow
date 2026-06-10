FROM node:18-alpine

WORKDIR /app

# Install system dependencies needed for Prisma client compatibility
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install packages
RUN npm install

# Copy the rest of the application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose backend server port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
