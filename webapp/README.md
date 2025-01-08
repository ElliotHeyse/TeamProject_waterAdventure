# WaterAdventure Web Application

## Prerequisites

- [Bun](https://bun.sh) (v1.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v16 or higher)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

## Local Development Setup

1. Install dependencies:
```bash
bun install
```

2. Create the PostgreSQL database:
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE wateradventure;
CREATE USER wateradventure WITH ENCRYPTED PASSWORD 'wateradventure';
GRANT ALL PRIVILEGES ON DATABASE wateradventure TO wateradventure;

# Connect to the database and grant additional privileges
\c wateradventure
GRANT ALL ON SCHEMA public TO wateradventure;
```

3. Set up environment variables:
```bash
# Copy the environment file
cp .env.example .env

# For local development, use these settings in .env:
DATABASE_URL="postgresql://wateradventure:wateradventure@localhost:5432/wateradventure?schema=public"
NODE_ENV="development"
HOST="localhost"
PORT="5173"
```

4. Push the database schema and seed data:
```bash
bunx prisma db push
bunx prisma db seed
```

5. Start the development server:
```bash
bun run dev
```

The application will be available at http://localhost:5173

## Docker Deployment

1. Set up environment variables:
```bash
# Copy the environment file
cp .env.example .env

# For Docker deployment, use these settings in .env:
DATABASE_URL="postgresql://wateradventure:wateradventure@db:5432/wateradventure?schema=public"
NODE_ENV="development"
HOST="0.0.0.0"
PORT="5173"
```

2. Build and start the containers:
```bash
docker compose up --build
```

The application will be available at:
- Web App: http://localhost:5173
- Prisma Studio: http://localhost:5555
- PostgreSQL: localhost:5433 (from host machine)

Database credentials for external connections:
- Host: localhost
- Port: 5433
- Database: wateradventure
- Username: wateradventure
- Password: wateradventure

## Available Scripts

- `bun run dev` - Start the development server
- `bun run build` - Build the application for production
- `bun run preview` - Preview the production build
- `bunx prisma studio` - Open Prisma Studio for database management
- `bunx prisma db push` - Push schema changes to the database
- `bunx prisma db seed` - Seed the database with initial data

## Default Users

After seeding, the following users are available:

### Coach
- Email: coach@example.com
- Password: password123

### Parents
- Email: mchen@example.com
- Email: erodriguez@example.com
- Email: dwilliams@example.com
- Email: mgarcia@example.com
- Email: jwilson@example.com
- Password for all: password123

## Project Structure

```
webapp/
├── src/               # Source code
├── prisma/           # Database schema and migrations
├── static/           # Static assets
└── tests/            # Test files
```

## Environment Variables

The `.env.example` file contains all necessary environment variables with comments explaining their usage in different environments:

```env
# Database Configuration
# For local development: use localhost:5432
# For Docker: use db:5432
DATABASE_URL="postgresql://wateradventure:wateradventure@localhost:5432/wateradventure?schema=public"

# Node Environment
# development or production
NODE_ENV="development"

# Host Configuration
# For local development: localhost
# For Docker: 0.0.0.0
HOST="localhost"

# Port Configuration
# For local development: 5173
# For Docker: 5173 (mapped in docker-compose.yml)
PORT="5173"
```
