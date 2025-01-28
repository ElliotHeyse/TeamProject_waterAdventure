# WaterAdventure - Early Water Confidence Platform

[![Version](https://img.shields.io/badge/version-1.0.1-blue)](CHANGELOG.md)
[![Languages](https://img.shields.io/badge/Languages-EN%20NL%20FR-blue)](README.md)

A specialized platform connecting coaches and parents to help toddlers (2-6 years) develop water confidence through playful activities. Focus on early water familiarization and overcoming initial water fears through structured guidance and parent involvement.

## Features

- Coach Dashboard
  - Activity planning for water familiarization
  - Age-appropriate exercise management
  - Progress tracking with developmental milestones
  - Parent communication tools: chat
  - Exercise management with video demonstrations
  - Medal-based achievement review system (Gold, Silver, Bronze)
  - Submission status tracking

- Parent & Child App
  - Progress tracking
  - Level progression system
  - Coach communication tools: chat
  - Video submission capabilities for exercises

- Other Platform Features
  - Multi-language support (🇬🇧 🇳🇱 🇫🇷)

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) - Web application framework
- [TypeScript](https://www.typescriptlang.org/) - Programming language
- [Prisma](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/) - Database ORM and SQL database
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Docker](https://www.docker.com/) - Containerization

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v16 or higher)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

### Local Development Setup

1. Clone the repository and navigate to the webapp directory
2. Install dependencies:
   ```bash
   bun install
   ```

3. Create the PostgreSQL database:
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

4. Set up environment variables:
   ```bash
   # Copy the environment file
   cp .env.example .env
   ```

5. Initialize the database:
   ```bash
   bunx prisma db push
   bunx prisma db seed
   ```

6. Start the development server:
   ```bash
   bun start:ws //for the websocket
   bun start    //for the app
   ```

The application will be available at http://localhost:5173

### Default Test Accounts

After seeding, the following accounts are available for testing:

**Coach**
- Email: demo@demo.com
- Password: demo

**Parents**
- Various test accounts available (see webapp documentation)
- Password for all: password123
- Also possible to register new accounts on the /login page

## Team & Partners

### Development Team

- [Degreef Dries](https://github.com/DriesDegreef) - Full Stack Developer
- [Heyse Elliot](https://github.com/ElliotHeyse) - Full Stack Developer
- [Snaet Warre](https://github.com/SnaetWarre) - Full Stack Developer

### Project Partners

- [Howest](https://www.howest.be/) - University of Applied Sciences
- [Sportinnovatiecampus Brugge](https://www.sportinnovatiecampus.be/) - Sports Innovation Campus
- [Zwemfed](https://www.zwemfed.be/) - Flemish Swimming Federation

_This project was developed as part of the MCT curriculum at Howest._
