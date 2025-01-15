#!/bin/bash

# Ensure we're in the webapp directory
cd "$(dirname "$0")/.."

# Extract database configuration from .env
if [ -f .env ]; then
    # Read DATABASE_URL from .env
    DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"')

    # Parse the connection string
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
else
    echo "Error: .env file not found!"
    exit 1
fi

echo "🗑️  Dropping database if it exists..."
PGPASSWORD=$DB_PASSWORD dropdb -U $DB_USER $DB_NAME --if-exists

echo "🆕 Creating fresh database..."
PGPASSWORD=$DB_PASSWORD createdb -U $DB_USER $DB_NAME

echo "🔄 Running Prisma DB Push..."
bunx prisma db push

echo "🌱 Seeding database..."
bunx prisma db seed

echo "✅ Database reset complete!" 