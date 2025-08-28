# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Turborepo monorepo with two main applications:

### Apps Structure
- **`apps/api/`**: NestJS backend API with JWT authentication, user management, and Prisma ORM
- **`apps/web/`**: Next.js frontend application with TailwindCSS

### Key Technologies
- **Backend**: NestJS, Prisma (SQLite), JWT authentication, bcrypt password hashing
- **Frontend**: Next.js 15.5.0, React 19, TailwindCSS v4
- **Database**: SQLite via Prisma ORM
- **Package Manager**: pnpm (required - see packageManager field)
- **Build System**: Turborepo for monorepo orchestration

### Authentication System
The API implements JWT-based authentication with:
- User registration with bcrypt password hashing (12 salt rounds)
- Login/authentication via email and password
- JWT tokens with 1-day expiration
- Auth guard protection for secured endpoints
- Last access tracking

## Development Commands

### Root Level (Turborepo)
```bash
pnpm dev           # Start all applications in development mode
pnpm build         # Build all applications
pnpm lint          # Lint all applications
pnpm format        # Format code with Prettier
pnpm check-types   # Run TypeScript type checking
```

### API Development (apps/api/)
```bash
cd apps/api
pnpm dev                    # Start NestJS in watch mode
pnpm build                  # Build the API
pnpm test                   # Run unit tests with Jest
pnpm test:e2e               # Run end-to-end tests
pnpm test:cov               # Run tests with coverage
pnpm lint                   # ESLint with auto-fix

# Database operations
pnpm db:generate            # Generate Prisma client
pnpm db:push                # Push schema to database
pnpm db:migrate             # Run database migrations
pnpm db:studio              # Open Prisma Studio
pnpm db:seed                # Run database seeding
```

### Web Development (apps/web/)
```bash
cd apps/web
pnpm dev                    # Start Next.js development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
```

### Filtered Commands (from root)
```bash
turbo dev --filter=api      # Run only API in dev mode
turbo dev --filter=web      # Run only web in dev mode
turbo build --filter=api    # Build only API
```

## Database Schema

Current Prisma schema includes:
- **User model**: id (UUID), email (unique), name, password (bcrypt hashed), lastAccess, timestamps

## Project Patterns

### API Structure
- Controllers handle HTTP requests and validation
- Services contain business logic
- DTOs for request/response validation with class-validator
- Prisma service for database operations
- JWT authentication with guards
- Comprehensive error handling with NestJS exceptions

### Code Organization
- Modular architecture with separate modules for auth and user management
- Password security with bcrypt (never store plain text passwords)
- Consistent error responses and HTTP status codes
- TypeScript throughout with strict typing