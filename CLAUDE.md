# CLAUDE.md - Woerk Supercomputer Resource Management System

Quick reference guide for Claude Code when working with the Woerk application.

## Project Overview

**Woerk** is a comprehensive resource management platform for AI supercomputer facilities, providing:
- Self-service user and project management
- Resource allocation and tracking
- Multi-university light federation support
- Integration with research infrastructure (grants.gov, LDAP, GitHub)
- Web-based terminal and file management

## Documentation Structure

### Core Documentation
- **[TECHNICAL.md](./docs/TECHNICAL.md)** - Technology stack, architecture, compatibility notes
- **[API-SPEC.md](./docs/API-SPEC.md)** - Complete API documentation and endpoints
- **[SETUP.md](./docs/SETUP.md)** - Installation and deployment instructions
- **[WORKFLOWS.md](./docs/WORKFLOWS.md)** - User flows and business logic

### Requirements & Design
- **[REQUIRED.md](./docs/REQUIRED.md)** - Business requirements and features
- **[DBMODEL.md](./docs/DBMODEL.md)** - Database schema and relationships

## Quick Reference

### Technology Stack
- **Frontend**: Next.js 15.5.2, TypeScript, Tailwind CSS 3.4.17 (NOT v4)
- **Backend**: NestJS with Express (NOT Fastify), Prisma ORM
- **Database**: PostgreSQL 16.9 with JSONB support
- **Authentication**: JWT with Passport
- **Terminal**: xterm.js 5.5.0
- **Queue**: pg-boss (planned)

### Port Configuration
- **Development**: Frontend 3020, Backend 3021
- **Production**: Frontend 3010, Backend 3011

### Critical Compatibility Notes
⚠️ **MUST use Tailwind CSS v3.x** - Next.js 15 + Tailwind v4 causes build failures
⚠️ **Use Express adapter** for NestJS - Fastify has WebSocket issues
⚠️ **Dynamic imports** for xterm.js - Avoid SSR conflicts

## Application UI Structure

### Tab 1: User Account Management

**User Registration & Authentication:**

- Users sign up with their university email address, enter .edu emil address -> next -> check if account already exists, prompt for auth option (password for external users, azure login for internal -> if account does not exist send link via email to setup new account or, if university is integrated redirect authentication to university)
- Email verification required, email needs to e verified at regular intervals configured by administrator
- some university email domains will be integrated via federation (for example oregonstate.edu). Needs to be configurable by admin 
- 
- Basic information collection:
  - Full name
  - Title/Position
  - Role: staff / professional faculty or Faculty
  - University and Department

**Linked Identity Management:**
Users can link additional identities:

1. **Google Account** - Not necessarily ending with university email domain, store email identity and underlying long int google id
2. **GitHub Account** - For code repository integration, store the github user id as well as the unterlying long int github numeric id
3. **ORCID Account** - For researcher identification
4. **LinkedIN account** - For addional infornmation (required for users that do not have an .edu email address )

Default billing information: for home university (e.g. oregonstate.edu) these need to be 2 fields: Default Index (billing account) and "Default Activity Code" or users will not be able to create woerk IDs 

### Tab 2: Resource Management

#### Projects / Woerks 

**Project Management System:**

- Users can create new projects (called "woerks")
- Projects displayed in a list view

**Project Attributes:**

- **Woerk ID**: randomly assinged 5-character alphanumeric identifier with hyphen as middle character (e.g., AB-12). The alphanumeric identifier must be glo
- **Short Name**: Maximum 30 characters
- **Description**: Maximum 1024 characters

**Project Classification:**

- **Non-grant Projects**: No additional metadata required
- **U.S. Federal Projects**:
  - Search interface connected to grants.gov API
  - Multi-word search capability across all fields
  - API endpoints:
    - `https://www.grants.gov/api/common/search2`
    - `https://www.grants.gov/api/common/fetchopportunity`
  - Retrieved data stored locally:
    - Project ID
    - Funding agency
    - API information
    - Project description
  
#### Allocations 

### Tab 3: Authorization Management

**Group Management:**

- Integration with LDAPS and Grouper API
  - See Grouper Rest API  
  - https://software.internet2.edu/grouper/doc/master/grouper-ws-parent/grouper-ws/apidocs/edu/internet2/middleware/grouper/ws/rest/package-summary.html
  - https://github.com/Internet2/grouper/tree/GROUPER_5_BRANCH/grouper-ws/grouper-ws/src/grouper-ws/edu/internet2/middleware/grouper/ws/rest
- Groups assigned to specific projects
- Features:
  - Project selection dropdown
  - List of all groups assigned to selected project
  - Create new groups
  - Manage group membership

### Tab 4: File Management

**Web-based File Transfer Interface:**

- Upload and download capabilities
- Target folder selection via dropdown menu
- Support for both:
  - POSIX-based storage
  - S3-based storage

### Tab 5: Terminal Access

**SSH Terminal Component:**

- Based on xterm.js (https://xtermjs.org/)
- Direct login to bastion SSH host
- Authentication via secure SSH certificates

## Technical Requirements

- Multi-university support (approximately 12 institutions)
- Secure authentication and authorization
- Integration with external APIs (grants.gov, LDAPS/Grouper)
- Web-based terminal emulation
- Support for multiple storage backends

### Tab 6: Github Access

- by default empty tab unless users have linked their github account in Tab 1, point users to tab 1
- searchable pull down field that allows you to either pick or enter a github https://url

## Technical Implementation Notes & Lessons Learned

### Port Configuration (CRITICAL)
- **Development Ports**: Frontend 3021, Backend 3020
- **Production Ports**: Frontend 3011, Backend 3010  
- **Default Ports**: Frontend 3011, Backend 3010 (in .env files)
- Always use different port ranges to avoid conflicts with common dev tools

### Database Setup
1. Create database: `sudo -u postgres psql -c "CREATE DATABASE woerk_db;"`
2. Set postgres password: `sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"`
3. Use connection string: `postgresql://postgres:postgres@localhost:5432/woerk_db?schema=public`
4. Run migrations: `npx prisma migrate dev --name init`

### Next.js 15 + Tailwind CSS Issues & Solutions
**CRITICAL**: Next.js 15 installs Tailwind CSS v4 (beta) by default which breaks standard utility classes.

**Solution**:
1. Uninstall Tailwind v4: `npm uninstall tailwindcss @tailwindcss/postcss`
2. Install Tailwind v3: `npm install tailwindcss@3 autoprefixer postcss`
3. Use standard PostCSS config:
```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Authentication Issues
- NextAuth v5 (beta) has compatibility issues with Next.js 15
- For development, use simple credential-based auth or mock auth
- OAuth providers require proper client IDs or will cause build failures
- Use simplified auth route handlers for Next.js 15 compatibility

### xterm.js Integration
- Must be dynamically imported client-side only to avoid SSR issues
- Use `@xterm/xterm` and `@xterm/addon-fit` (not deprecated `xterm` package)
- Wrap terminal initialization in `isClient` check
- Use null checks for all xterm method calls

### TypeScript Configuration
- Set `"strict": true` in tsconfig.json
- Avoid `any` types - use proper interfaces
- Use `React.forwardRef` with proper typing for components
- Import React hooks with proper dependency arrays

### Build & Development Scripts
Create these scripts for consistent development:

**start-dev.sh**: Development with ports 3020/3021
**start-prod.sh**: Production with ports 3010/3011  
**restart.sh**: Kill processes and restart with updated code

### Component Library Pattern
Use shadcn/ui pattern:
- Components in `components/ui/` 
- Page-specific components in `components/tabs/`
- Shared utilities in `lib/utils.ts`
- CSS variables in `globals.css` with proper HSL values

### Database Schema Notes
- Use `@map()` for snake_case database columns
- Include NextAuth models (Account, Session, VerificationToken)
- Create indexes for foreign keys and query performance
- Use proper Prisma relations with cascade deletes

### Prisma Setup
- Backend: Standard Prisma setup with PrismaService
- Frontend: Copy schema and run `npx prisma generate` for NextAuth
- Both need same DATABASE_URL in .env files
- Use global PrismaService module in NestJS

### Environment Variables
Must set these for proper operation:
```bash
# Backend (.env)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/woerk_db?schema=public"
PORT=3010
JWT_SECRET="your-secret-here"
CORS_ORIGIN="http://localhost:3011,http://localhost:3021"

# Frontend (.env)  
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/woerk_db?schema=public"
NEXTAUTH_URL=http://localhost:3011
NEXTAUTH_SECRET="your-secret-here"
NEXT_PUBLIC_API_URL=http://localhost:3010
NEXT_PUBLIC_WS_URL=ws://localhost:3010
```

### Common Build Failures & Solutions
1. **"@prisma/client did not initialize"**: Run `npx prisma generate` in both frontend and backend
2. **"border-border unknown utility"**: Tailwind v4 incompatibility - downgrade to v3
3. **"asChild not found"**: Use standard JSX patterns, not advanced component composition
4. **"self is not defined"**: xterm.js SSR issue - use dynamic imports with client-side checks
5. **Port conflicts**: Always kill existing processes before starting new ones

### Testing Commands
- Build frontend: `npm run build` (must succeed without CSS errors)
- Test backend: `curl http://localhost:3010` should return "Hello World!"  
- Test API docs: `curl http://localhost:3010/api` should return Swagger UI
- Test database: `psql -U postgres -h localhost woerk_db -c "SELECT * FROM users LIMIT 1;"`

### Project Structure Created
```
├── backend/
│   ├── src/
│   │   ├── auth/ (JWT auth with passport)
│   │   ├── projects/ (CRUD operations)  
│   │   ├── prisma/ (database service)
│   │   └── main.ts (Fastify setup)
│   └── prisma/schema.prisma
├── frontend/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/ (auth routes)
│   │   └── page.tsx (main app)
│   ├── components/
│   │   ├── ui/ (button, input, card, label)
│   │   ├── tabs/ (user-account, resources, terminal, github)
│   │   └── main-tabs.tsx
│   └── lib/utils.ts
├── start-dev.sh (development: ports 3020/3021)
├── start-prod.sh (production: ports 3010/3011)  
└── restart.sh (kill and restart)
```

### Dependencies That Work Together
```json
{
  "tailwindcss": "^3.4.17",
  "@xterm/xterm": "^5.5.0", 
  "@xterm/addon-fit": "^0.10.0",
  "@radix-ui/react-tabs": "^1.1.13",
  "next": "15.5.2",
  "@nestjs/platform-express": "^10.0.0"
}
```
Note: Avoid Fastify adapter - causes port binding issues. Use Express.

### Key Implementation Patterns
- Tab-based SPA with Radix UI Tabs
- Each tab is a separate component in `components/tabs/`
- Use consistent Card/Button/Input UI components  
- Client-side state management with React hooks
- API calls to backend at `NEXT_PUBLIC_API_URL`
- Woerk ID generation: 2 letters + hyphen + 2 alphanumeric (e.g., "AB-1C")


