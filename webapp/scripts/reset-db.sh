#!/bin/bash

# Database configuration
DB_NAME="wateradventure"
DB_USER="postgres"
DB_PASSWORD="dries"

# Ensure we're in the webapp directory
cd "$(dirname "$0")/.."

echo "🗑️  Dropping database if it exists..."
PGPASSWORD=$DB_PASSWORD dropdb -U $DB_USER $DB_NAME --if-exists

echo "🆕 Creating fresh database..."
PGPASSWORD=$DB_PASSWORD createdb -U $DB_USER $DB_NAME

echo "🔄 Running Prisma DB Push..."
bunx prisma db push

echo "🌱 Seeding database..."
bunx prisma db seed

echo "✅ Database reset complete!" 