# Technical Implementation Guide

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.17 (NOT v4 - incompatible with Next.js 15)
- **UI Components**: Radix UI
- **State Management**: React Query (TanStack Query)
- **Terminal**: xterm.js 5.5.0
- **WebSocket**: socket.io-client 4.8.1

### Backend
- **Framework**: NestJS with Express adapter (Fastify has compatibility issues)
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 16.9
- **ORM**: Prisma 6.15.0
- **Authentication**: Passport JWT
- **Queue**: pg-boss (planned)
- **Validation**: class-validator

### Development Tools
- **Node.js**: 20.x or higher
- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js)
- **Linting**: ESLint 9

## Port Configuration

### Development Ports
- Frontend: 3020
- Backend: 3021

### Production Ports
- Frontend: 3010
- Backend: 3011

Configure in:
- Frontend: `.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:3021`
- Backend: `.env` → `PORT=3021`

## Critical Compatibility Notes

### ⚠️ Tailwind CSS Version
**MUST use Tailwind CSS v3.x (3.4.17), NOT v4.x**

Next.js 15 defaults to Tailwind v4 beta which causes:
- "Cannot apply unknown utility class" errors
- White-on-white styling issues ("East Frisian flag" problem)
- Build failures

Fix: `npm install tailwindcss@3.4.17`

### ⚠️ NextAuth/Auth.js Version
NextAuth v5 has compatibility issues with Next.js 15.
- Use JWT-based authentication with backend instead
- Or downgrade to NextAuth v4 if OAuth is critical

### ⚠️ NestJS Adapter
Use Express adapter, not Fastify:
- Fastify has WebSocket compatibility issues
- Express has better ecosystem support

## Project Structure

```
entryhall/
├── frontend/                 # Next.js application
│   ├── app/                 # App Router pages
│   │   ├── (auth)/         # Auth pages (login, register)
│   │   ├── api/            # API route handlers
│   │   └── dashboard/      # Main application
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── tabs/           # Tab-specific components
│   │   └── ui/             # Shared UI components
│   ├── lib/                # Utilities and helpers
│   └── styles/             # Global styles
│
├── backend/                 # NestJS application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── projects/       # Project/Woerk management
│   │   ├── groups/         # Authorization groups
│   │   ├── files/          # File management
│   │   └── terminal/       # SSH terminal
│   └── prisma/
│       └── schema.prisma   # Database schema
│
└── agents/                  # Python software agents
    ├── resource_monitor.py
    └── command_executor.py
```

## Build & Deployment

### Development Setup
```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Generate Prisma client (BOTH directories)
cd backend && npx prisma generate
cd ../frontend && npx prisma generate

# Run migrations
cd backend && npx prisma migrate dev

# Start development servers
./start-dev.sh
```

### Production Build
```bash
# Frontend
cd frontend
NEXT_TELEMETRY_DISABLED=1 npm run build
PORT=3010 npm start

# Backend
cd backend
npm run build
PORT=3011 npm run start:prod
```

### Common Build Errors & Solutions

1. **"Cannot apply unknown utility class"**
   - Cause: Tailwind CSS v4 incompatibility
   - Fix: Downgrade to v3.4.17

2. **"@prisma/client did not initialize"**
   - Cause: Missing Prisma generation
   - Fix: Run `npx prisma generate` in BOTH frontend and backend

3. **"self is not defined"** (xterm.js)
   - Cause: SSR incompatibility
   - Fix: Use dynamic imports with `ssr: false`

4. **White-on-white styling**
   - Cause: Missing CSS variables
   - Fix: Ensure globals.css has proper HSL color definitions

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3021
NEXT_PUBLIC_WS_URL=ws://localhost:3021
```

### Backend (.env)
```bash
PORT=3021
DATABASE_URL="postgresql://user:password@localhost:5432/woerk"
JWT_SECRET="your-secret-key"
```

## Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

## Testing

### Frontend
```bash
npm run lint
npm run type-check  # If configured
```

### Backend
```bash
npm run lint
npm run test
npm run test:e2e
```

## Performance Optimization

- Use Turbopack for faster builds
- Implement proper caching with React Query
- Use database indexes for frequent queries
- Implement pagination for large datasets
- Use WebSocket for real-time updates