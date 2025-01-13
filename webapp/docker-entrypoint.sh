#!/bin/sh

set -e  # Exit on error
set -x  # Print commands as they are executed

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done

# Push schema changes without seeding
echo "Pushing schema changes..."
bunx prisma db push

echo "Checking database tables..."
bunx prisma db pull

# Start Prisma Studio in background
echo "Starting Prisma Studio..."
bunx prisma studio &

# Prepare SvelteKit
echo "Preparing SvelteKit..."
bunx svelte-kit sync

# Start the application in development mode
echo "Starting the application in development mode..."
exec bun --bun run dev --host 0.0.0.0