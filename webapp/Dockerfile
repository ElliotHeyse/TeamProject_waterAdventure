# Development stage only
FROM oven/bun:1-alpine

# Install netcat for database connection checking
RUN apk add --no-cache netcat-openbsd

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Ensure proper permissions
RUN chmod +x prisma/seed.ts && \
    chmod +x /app/node_modules/.bin/*

# Generate Prisma client
RUN bunx prisma generate

# Copy the startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the port the app runs on
EXPOSE 3000 5555

# Use the startup script as entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]