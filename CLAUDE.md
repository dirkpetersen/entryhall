# CLAUDE.md - Woerk Supercomputer Resource Management System

Quick reference guide for Claude Code when working with the Woerk application.

## Project Overview

**Woerk** is a comprehensive resource management platform for AI supercomputer facilities, providing:

-   User account management.
-   Self-service user and project management
-   Resource allocation and tracking
-   Multi-university light federation support
-   Integration with research infrastructure (grants.gov, LDAP, GitHub)
-   Web-based terminal and file management

## Documentation Structure

### Core Documentation

-   [TECHNICAL.md](./docs/TECHNICAL.md) - Technology stack, architecture, compatibility notes
-   [API-SPEC.md](./docs/API-SPEC.md) - Complete API documentation and endpoints
-   [SETUP.md](./docs/SETUP.md) - Installation and deployment instructions
-   [WORKFLOWS.md](./docs/WORKFLOWS.md) - User flows and business logic

### Requirements & Design

-   [REQUIRED.md](./docs/REQUIRED.md) - Business requirements and features
-   [DBMODEL.md](./docs/DBMODEL.md) - Database schema and relationships

## Quick Reference

### Technology Stack

-   **Frontend**: Next.js 15.5.2, TypeScript, Tailwind CSS 3.4.17 (NOT v4)
-   **Backend**: NestJS with Express (NOT Fastify), Prisma ORM
-   **Database**: PostgreSQL 16.9 with JSONB support
-   **Authentication**: JWT with Passport
-   **Terminal**: xterm.js 5.5.0
-   **Queue**: pg-boss (planned)
-   **Emailer**: AWS SES (working with pg-boss

### Port Configuration

-   **Development**: Frontend 3020, Backend 3021
-   **Production**: Frontend 3010, Backend 3011

### Critical Compatibility Notes

-   **MUST use Tailwind CSS v3.x - Next.js 15 + Tailwind v4 causes build failures**
-   **Use Express adapter for NestJS - Fastify has WebSocket issues**
-   **Dynamic imports for xterm.js - Avoid SSR conflicts**

## Application UI Structure

The application has multiple tabs that address different topics. Before the user can see any tabs, they need to log in or register. The only thing that they should be able to see first is a short description of what Woerk is all about and a field where they enter their primary e-mail address of their primary organization or employer. Then they click a button with the caption “Next”. If the E-mail address does not end in “.edu” the user will be denied access, otherwise It depends on the state of their account:

-   If it's a new account a link should be sent to that e-mail address. They click the link in their email to confirm they have a valid identity at the university that provisioned the email address. The link takes them back to the same UI to complete their account setup. Now they select an authentication provider which can be one that is commonly used by researchers, for example google, github, orcid or linkedin. Then they are asked to authenticate against that chosen provider. In the background, a link is created in the database between the .edu identity (email address) and the other identity (also an email address, for example a gmail address).
-   If it is an existing account, the user would be directed to the preferred authentication provider right away  
      
    Once the authentication is successful all tabs are shown

### Tab 1: User Account Management

**User Registration & Authentication:**

-   Users sign up with their university email address, they need to enter an address that ends with .edu -\> next -\> check if account already exists, prompt for auth option (password for external users, azure login for internal -\> if account does not exist send link via email to setup new account or, if university is integrated redirect authentication to university)
-   Email verification required, email needs to e verified at regular intervals configured by administrator
-   some university email domains will be integrated via federation (for example oregonstate.edu). Needs to be configurable by admin
-   
-   Basic information collection:
    -   Full name
    -   Title/Position
    -   Role: staff / professional faculty or Faculty
    -   University and Department

**Linked Identity Management:** Users can link additional identities:

1.  **Google Account** - Not necessarily ending with university email domain, store email identity and underlying long int google id
2.  **GitHub Account** - For code repository integration, store the github user id as well as the unterlying long int github numeric id
3.  **ORCID Account** - For researcher identification
4.  **LinkedIN account** - For addional infornmation (required for users that do not have an .edu email address )

Default billing information: for home university (e.g. oregonstate.edu) these need to be 2 fields: Default Index (billing account) and "Default Activity Code" or users will not be able to create woerk IDs

### Tab 2: Resource Management

#### Projects / Woerks

**Project Management System:**

-   Users can create new projects (called "woerks")
-   Projects displayed in a list view

**Project Attributes:**

-   **Woerk ID**: randomly assinged 5-character alphanumeric identifier with hyphen as middle character (e.g., AB-12). The alphanumeric identifier must be glo
-   **Short Name**: Maximum 30 characters
-   **Description**: Maximum 1024 characters

**Project Classification:**

-   **Non-grant Projects**: No additional metadata required
-   **U.S. Federal Projects**:
    -   Search interface connected to grants.gov API
    -   Multi-word search capability across all fields
    -   API endpoints:
        -   `https://www.grants.gov/api/common/search2`
        -   `https://www.grants.gov/api/common/fetchopportunity`
    -   Retrieved data stored locally:
        -   Project ID
        -   Funding agency
        -   API information
        -   Project description

#### Allocations

### Tab 3: Authorization Management

**Group Management:**

-   Integration with LDAPS and Grouper API
    -   See Grouper Rest API
    -   https://software.internet2.edu/grouper/doc/master/grouper-ws-parent/grouper-ws/apidocs/edu/internet2/middleware/grouper/ws/rest/package-summary.html
    -   https://github.com/Internet2/grouper/tree/GROUPER_5_BRANCH/grouper-ws/grouper-ws/src/grouper-ws/edu/internet2/middleware/grouper/ws/rest
-   Groups assigned to specific projects
-   Features:
    -   Project selection dropdown
    -   List of all groups assigned to selected project
    -   Create new groups
    -   Manage group membership

### Tab 4: File Management

**Web-based File Transfer Interface:**

-   Upload and download capabilities
-   Target folder selection via dropdown menu
-   Support for both:
    -   POSIX-based storage
    -   S3-based storage

### Tab 5: Terminal Access

**SSH Terminal Component:**

-   Based on xterm.js (https://xtermjs.org/)
-   Direct login to bastion SSH host
-   Authentication via secure SSH certificates

## Technical Requirements

-   Multi-university support (approximately 12 institutions)
-   Secure authentication and authorization
-   Integration with external APIs (grants.gov, LDAPS/Grouper)
-   Web-based terminal emulation
-   Support for multiple storage backends

### Tab 6: Github Access

-   by default empty tab unless users have linked their github account in Tab 1, point users to tab 1
-   searchable pull down field that allows you to either pick or enter a github https://url

## Technical Implementation Notes & Lessons Learned

### Port Configuration (CRITICAL)

-   **Development Ports**: Frontend 3021, Backend 3020
-   **Production Ports**: Frontend 3011, Backend 3010
-   **Default Ports**: Frontend 3011, Backend 3010 (in .env files)
-   Always use different port ranges to avoid conflicts with common dev tools

### Database Setup

1.  Create database: `sudo -u postgres psql -c "CREATE DATABASE woerk_db;"`
2.  Set postgres password: `sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"`
3.  Use connection string: `postgresql://postgres:postgres@localhost:5432/woerk_db?schema=public`
4.  Run migrations: `npx prisma migrate dev --name init`

### Next.js 15 + Tailwind CSS Issues & Solutions

**CRITICAL**: Next.js 15 installs Tailwind CSS v4 (beta) by default which breaks standard utility classes.

**Solution**:

1.  Uninstall Tailwind v4: `npm uninstall tailwindcss @tailwindcss/postcss`
2.  Install Tailwind v3: `npm install tailwindcss@3 autoprefixer postcss`
3.  Use standard PostCSS config:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Authentication Issues

-   NextAuth v5 (beta) has compatibility issues with Next.js 15
-   For development, use simple credential-based auth or mock auth
-   OAuth providers require proper client IDs or will cause build failures
-   Use simplified auth route handlers for Next.js 15 compatibility

### xterm.js Integration

-   Must be dynamically imported client-side only to avoid SSR issues
-   Use `@xterm/xterm` and `@xterm/addon-fit` (not deprecated `xterm` package)
-   Wrap terminal initialization in `isClient` check
-   Use null checks for all xterm method calls

### TypeScript Configuration

-   Set `"strict": true` in tsconfig.json
-   Avoid `any` types - use proper interfaces
-   Use `React.forwardRef` with proper typing for components
-   Import React hooks with proper dependency arrays

### Build & Development Scripts

Create these scripts for consistent development:

**start-dev.sh**: Development with ports 3020/3021 **start-prod.sh**: Production with ports 3010/3011  
**restart.sh**: Kill processes and restart with updated code

### Component Library Pattern

Use shadcn/ui pattern:

-   Components in `components/ui/`
-   Page-specific components in `components/tabs/`
-   Shared utilities in `lib/utils.ts`
-   CSS variables in `globals.css` with proper HSL values

### Database Schema Notes

-   Use `@map()` for snake_case database columns
-   Include NextAuth models (Account, Session, VerificationToken)
-   Create indexes for foreign keys and query performance
-   Use proper Prisma relations with cascade deletes

### Prisma Setup

-   Backend: Standard Prisma setup with PrismaService
-   Frontend: Copy schema and run `npx prisma generate` for NextAuth
-   Both need same DATABASE_URL in .env files
-   Use global PrismaService module in NestJS

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

1.  **"@prisma/client did not initialize"**: Run `npx prisma generate` in both frontend and backend
2.  **"border-border unknown utility"**: Tailwind v4 incompatibility - downgrade to v3
3.  **"asChild not found"**: Use standard JSX patterns, not advanced component composition
4.  **"self is not defined"**: xterm.js SSR issue - use dynamic imports with client-side checks
5.  **Port conflicts**: Always kill existing processes before starting new ones
6.  **"Queue cleanup-jobs not found"**: pg-boss scheduling issues on first setup - avoid scheduling jobs during initialization
7.  **"DMARC policy of reject"**: Never send from university domains - use verified domains you control
8.  **"Unsupported provider: verify"**: Route order matters - specific routes must come before wildcard routes (:provider)
9.  **Wrong redirect port**: FRONTEND_URL must point to frontend port (3021), not backend port (3020)
10. **pg-boss null job IDs**: Queue may not process jobs immediately - use direct email sending for critical flows

### Testing Commands

**Application Testing**:
-   Build frontend: `npm run build` (must succeed without CSS errors)
-   Test backend: `curl http://localhost:3010` should return "Hello World!"
-   Test API docs: `curl http://localhost:3010/api` should return Swagger UI
-   Test database: `psql -U postgres -h localhost woerk_db -c "SELECT * FROM users LIMIT 1;"`

**Email System Testing**:
-   **Test any email**: `AWS_PROFILE=sendmail node backend/test-any-email.js test@university.edu`
-   **Test DMARC-safe delivery**: `AWS_PROFILE=sendmail node backend/test-no-dmarc.js your@email.edu`
-   **Check SES status**: `AWS_PROFILE=sendmail node backend/check-ses-status.js`
-   **List verified emails**: `AWS_PROFILE=sendmail node backend/list-verified-emails.js`
-   **Verify new email**: `AWS_PROFILE=sendmail node backend/verify-ses-email.js new@email.edu`

**Authentication API Testing**:
-   **Check account**: `curl -X POST http://localhost:3020/auth/check-account -H "Content-Type: application/json" -d '{"email":"test@oregonstate.edu"}'`
-   **Send verification**: `curl -X POST http://localhost:3020/auth/send-verification -H "Content-Type: application/json" -d '{"email":"test@oregonstate.edu"}'`
-   **Test OAuth URL**: `curl "http://localhost:3020/auth/oauth/google?email=test@oregonstate.edu"`
-   **Test OAuth callback**: `curl -X POST http://localhost:3020/auth/callback -H "Content-Type: application/json" -d '{"code":"test","state":"test","provider":"google"}'`

### Complete Project Structure Implemented

```
entryhall/
├── docs/                        # Comprehensive documentation
│   ├── TECHNICAL.md            # Tech stack & compatibility
│   ├── API-SPEC.md             # Complete API docs
│   ├── SETUP.md                # Installation guide
│   ├── WORKFLOWS.md            # Business logic & flows
│   ├── REQUIRED.md             # Requirements & acceptance criteria
│   └── DBMODEL.md              # Database schema & samples
├── .env.default                # Complete env var reference
├── CLAUDE.md                   # Quick reference (this file)
├── README.md                   # Project overview
├── start-dev.sh               # Development: PostgreSQL check + 3020/3021
├── start-prod.sh              # Production: PostgreSQL check + 3010/3011
├── restart.sh                 # Clean restart with PostgreSQL check
├── backend/
│   ├── src/
│   │   ├── auth/              # Complete auth system
│   │   │   ├── auth.controller.ts (all auth endpoints)
│   │   │   ├── auth.service.ts (email verification logic)
│   │   │   ├── auth.module.ts (with queue integration)
│   │   │   ├── jwt.strategy.ts
│   │   │   └── guards/
│   │   ├── email/             # AWS SES email system
│   │   │   ├── email.service.ts (SES + templates)
│   │   │   └── email.module.ts
│   │   ├── queue/             # Background job processing
│   │   │   ├── queue.service.ts (pg-boss integration)
│   │   │   └── queue.module.ts
│   │   ├── projects/          # Project/Woerk management
│   │   ├── prisma/            # Database service
│   │   └── main.ts            # Express server setup
│   ├── prisma/
│   │   ├── schema.prisma      # Complete schema with auth models
│   │   └── migrations/        # Email verification migration
│   ├── test-*.js              # Comprehensive email testing suite
│   └── .env                   # AWS profile configuration
├── frontend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── callback/      # OAuth callback handler
│   │   │   └── verify/        # Email verification handler
│   │   ├── page.tsx           # Main app with auth-first logic
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/              # Complete authentication flow
│   │   │   ├── welcome-page.tsx (email entry + description)
│   │   │   ├── account-setup.tsx (OAuth provider selection)  
│   │   │   ├── email-verification.tsx (verification flow)
│   │   │   └── auth-flow.tsx (orchestrates entire flow)
│   │   ├── tabs/              # Application tabs (post-auth)
│   │   │   ├── user-account-tab.tsx
│   │   │   ├── resources-tab.tsx
│   │   │   ├── terminal-tab.tsx
│   │   │   └── github-tab.tsx
│   │   ├── ui/                # Consistent UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── label.tsx
│   │   └── main-tabs.tsx      # Main tabbed interface
│   └── lib/utils.ts
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

### Email System Implementation & AWS SES Integration

**CRITICAL EMAIL SETUP**:
-   **AWS Profile Required**: Use `AWS_PROFILE=sendmail` (has AmazonSESFullAccess)
-   **DMARC Compliance**: NEVER send from university domains you don't control
-   **Verified Sender**: Use `oregonstate-arcs@osu.internetchen.de` (DMARC-safe)
-   **Email Templates**: Professional HTML templates with university branding

**Email Dependencies**:
```json
{
  "@aws-sdk/client-ses": "latest",
  "pg-boss": "latest", 
  "@nestjs/config": "latest"
}
```

**Backend Email Structure**:
```
├── src/email/
│   ├── email.service.ts (AWS SES integration)
│   └── email.module.ts
├── src/queue/
│   ├── queue.service.ts (pg-boss background jobs)
│   └── queue.module.ts
└── test-email scripts for debugging
```

**Environment Variables for Email**:
```bash
# Backend (.env)
AWS_PROFILE="sendmail"
AWS_REGION="us-west-2"  
EMAIL_FROM="Woerk System <oregonstate-arcs@osu.internetchen.de>"
FRONTEND_URL="http://localhost:3020"
```

**Email Testing Commands**:
```bash
# Test any email (auto-verifies if needed)
AWS_PROFILE=sendmail node backend/test-any-email.js test@university.edu

# Test DMARC-compliant delivery
AWS_PROFILE=sendmail node backend/test-no-dmarc.js your@email.edu

# Check verified SES identities
AWS_PROFILE=sendmail node backend/list-verified-emails.js
```

**DMARC Issues & Solutions**:
1.  **Problem**: University domains (e.g., oregonstate.edu) have strict DMARC policies
2.  **Symptom**: "550 5.7.509 Access denied, DMARC policy of reject"
3.  **Solution**: Use verified domain you control (osu.internetchen.de)
4.  **Result**: Reliable delivery to all university email systems

**Authentication Flow Implementation**:
-   **Authentication-First UI**: No tabs visible until user is authenticated
-   **Email Validation**: Strict .edu domain checking before proceeding
-   **Professional Onboarding**: Clean welcome page → email entry → verification → OAuth setup
-   **OAuth Provider Support**: Google, GitHub, ORCID, LinkedIn with proper state management

**Complete Working Email Verification Flow**:
1.  **Frontend**: User enters .edu email → Saved to cookie → API call to `/auth/send-verification`
2.  **Backend**: Generates token, saves to database, sends email via AWS SES
3.  **Email**: Professional HTML template with verification link to `/auth/verify?token=...&email=...`
4.  **Verification**: GET route processes token, shows success page, auto-redirects to frontend
5.  **Frontend**: Detects `?verified=true` parameter, shows OAuth provider selection
6.  **OAuth Flow**: Frontend fetches OAuth URL from backend → Redirects to provider → Callback processed
7.  **Complete**: JWT token stored, user authenticated and gains access to all application tabs

**Critical Success Factors**:
-   ✅ Route order: `@Get('verify')` before `@Get('oauth/:provider')`
-   ✅ Direct email sending (bypasses pg-boss queue issues)
-   ✅ DMARC-compliant sender domain (oregonstate-arcs@osu.internetchen.de)
-   ✅ Correct frontend URL (port 3021, not 3020)
-   ✅ AWS profile with SES permissions (AWS_PROFILE=sendmail)
-   ✅ Professional HTML templates with university branding
-   ✅ Email remembering via secure cookie storage (30-day expiry)
-   ✅ OAuth callback processing with JWT token generation

**Database Updates for Authentication**:
-   Added `verification_token` and `verification_token_expires` to User model
-   Added `UserIdentity` model for OAuth provider linking  
-   Added `email_verified` boolean flag
-   Migration: `npx prisma migrate dev --name add_email_verification_system`

**Startup Script Enhancements**:
-   **PostgreSQL Auto-Start**: Scripts check `pg_isready` and auto-start via systemctl
-   **AWS Profile Integration**: All scripts use `AWS_PROFILE=sendmail`
-   **Error Handling**: Clear feedback for PostgreSQL and email service issues

**User Experience Enhancements**:
-   **Email Remembering**: Base64-encoded cookie storage for .edu emails (30-day expiry)
-   **Visual Feedback**: Green highlight and checkmark for pre-filled emails
-   **Clean UI**: No clutter - typing different email automatically clears highlighting
-   **OAuth Flow**: Seamless provider selection → authentication → token storage
-   **Auto-redirect**: Smooth transitions between verification, OAuth, and app access

### Key Implementation Patterns

-   **Authentication-First Architecture**: No application access without completed auth
-   Tab-based SPA with Radix UI Tabs (post-authentication)
-   Each tab is a separate component in `components/tabs/`
-   Use consistent Card/Button/Input UI components
-   Client-side state management with React hooks
-   API calls to backend at `NEXT_PUBLIC_API_URL`
-   Woerk ID generation: 2 letters + hyphen + 2 alphanumeric (e.g., "AB-1C")
-   **Background Job Processing**: pg-boss for reliable email delivery
-   **Professional Email Templates**: HTML emails with university branding

### Production Deployment Checklist

**Pre-Deployment Requirements**:
1.  **PostgreSQL**: Ensure PostgreSQL 16.9+ is installed and running
2.  **AWS SES**: Verify sender domain in SES console (avoid DMARC issues)
3.  **Environment Variables**: Copy from `.env.default` and configure production values
4.  **SSL Certificates**: Set up HTTPS for production frontend URLs
5.  **Database Migration**: Run `npx prisma migrate deploy` on production database

**Critical Production Settings**:
```bash
# Production Backend (.env)
NODE_ENV="production"
PORT=3011
AWS_PROFILE="sendmail"
EMAIL_FROM="Woerk System <noreply@your-verified-domain.edu>"
FRONTEND_URL="https://woerk.your-university.edu"
JWT_SECRET="generate-secure-production-secret"

# Production Frontend (.env.production)
NEXT_PUBLIC_API_URL="https://api.woerk.your-university.edu"
```

**Deployment Commands**:
```bash
# Backend
cd backend && npm run build && PM2_RUNTIME=true pm2 start dist/main.js

# Frontend  
cd frontend && npm run build && npm start

# With startup scripts
./start-prod.sh  # Uses ports 3010/3011
```

**Email System Production Notes**:
-   **NEVER use university domains** as senders without proper DMARC setup
-   **Always use verified domains** you control (e.g., osu.internetchen.de)
-   **Test email delivery** to all target university domains before launch
-   **Monitor pg-boss queue** for failed email jobs
-   **Set up email alerts** for system administrators

**Email Verification Routing (CRITICAL)**:
-   **Route Order**: Specific routes (`@Get('verify')`) must come BEFORE wildcard routes (`@Get(':provider')`)
-   **Backend Routing**: Use `/auth/verify` for email links, `/auth/oauth/:provider` for OAuth
-   **Frontend URLs**: Ensure `FRONTEND_URL` points to frontend port (3021), not backend (3020)
-   **Redirect Flow**: Email link → Backend verification → HTML success page → Frontend redirect
-   **Direct Email**: Use direct email sending instead of queue for immediate delivery

**Email Verification Implementation Pattern**:
```typescript
// WRONG - wildcard catches everything
@Get(':provider')          // This catches /auth/verify
@Get('verify')             // Never reached

// CORRECT - specific routes first  
@Get('verify')             // Handles email verification links
@Get('oauth/:provider')    // Handles OAuth provider initiation
```

**Environment Configuration**:
```bash
# Backend (.env) - CRITICAL for email verification
FRONTEND_URL="http://localhost:3021"  # Must be frontend port!
AWS_PROFILE="sendmail"                 # Profile with SES permissions
EMAIL_FROM="Woerk System <your-verified-domain@yourdomain.edu>"
GOOGLE_CLIENT_ID="your-client-id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Email Remembering Implementation**:
```typescript
// Cookie utilities in WelcomePage component
const saveEmailToCookie = (email: string): void => {
  const encodedEmail = btoa(email) // Base64 encode
  const expiryDate = new Date()
  expiryDate.setTime(expiryDate.getTime() + (30 * 24 * 60 * 60 * 1000))
  document.cookie = `woerk-email=${encodedEmail};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`
}

const getSavedEmail = (): string | null => {
  const cookies = document.cookie.split(';')
  const emailCookie = cookies.find(cookie => cookie.trim().startsWith('woerk-email='))
  return emailCookie ? atob(emailCookie.split('=')[1]) : null
}
```

**OAuth Flow Implementation**:
```typescript
// Frontend OAuth handling
const handleProviderSelect = async (provider: string) => {
  const response = await fetch(`/auth/oauth/${provider}?email=${email}`)
  const data = await response.json()
  if (data.url) {
    window.location.href = data.url // Redirect to OAuth provider
  }
}

// Backend OAuth callback (mock for testing)
const mockUser = { id: '1', email: 'user@edu', emailVerified: true }
const jwtToken = this.jwtService.sign({ email: mockUser.email, sub: mockUser.id })
return { token: jwtToken, user: mockUser }
```

**Monitoring & Health Checks**:
-   **Application Health**: `curl http://localhost:3011/health`
-   **Queue Health**: Check pg-boss admin interface
-   **Email Delivery**: Monitor AWS SES sending statistics
-   **Database**: Set up connection monitoring and backups

### Email Verification Troubleshooting

**Common Issues & Solutions**:

1.  **"Hello World!" instead of frontend**:
    -   **Cause**: `FRONTEND_URL` points to backend port (3020) instead of frontend (3021)
    -   **Fix**: Set `FRONTEND_URL="http://localhost:3021"` in backend/.env

2.  **"Unsupported provider: verify"**:
    -   **Cause**: Wildcard route `@Get(':provider')` catches `/auth/verify` before specific route
    -   **Fix**: Move `@Get('verify')` route BEFORE `@Get('oauth/:provider')` in controller

3.  **Email not received**:
    -   **Check**: Backend logs for "Email sent successfully" message
    -   **Check**: AWS SES sending statistics in console
    -   **Check**: SPAM/junk folders (especially for non-.edu senders)
    -   **Fix**: Ensure sender domain is verified in SES and DMARC-compliant

4.  **"Job ID: null" in logs**:
    -   **Cause**: pg-boss queue not processing jobs properly
    -   **Fix**: Use direct email sending instead of queuing for critical paths
    -   **Workaround**: Implement `sendVerificationEmailDirect()` method

5.  **DMARC policy rejection**:
    -   **Cause**: Trying to send from university domain without DMARC authorization
    -   **Symptom**: "550 5.7.509 Access denied, DMARC policy of reject"
    -   **Fix**: Use verified domain you control (e.g., oregonstate-arcs@osu.internetchen.de)

6.  **OAuth "client_id=undefined"**:
    -   **Cause**: Missing Google OAuth credentials in backend environment
    -   **Symptom**: OAuth URL contains `client_id=undefined`
    -   **Fix**: Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to backend/.env

7.  **OAuth callback "Missing parameters"**:
    -   **Cause**: Frontend callback expects provider parameter not in OAuth return URL
    -   **Fix**: Default to 'google' or store provider in OAuth state parameter
    -   **Frontend**: Fetch OAuth URL from backend then redirect (don't direct link)

8.  **Email not remembered**:
    -   **Cause**: Cookie not being set or retrieved properly
    -   **Fix**: Use Base64 encoding, 30-day expiry, SameSite=Lax
    -   **Visual**: Green highlight indicates remembered email working correctly

**Email Testing Workflow**:
```bash
# 1. Test AWS SES access
AWS_PROFILE=sendmail node backend/check-ses-status.js

# 2. Test email delivery
AWS_PROFILE=sendmail node backend/test-any-email.js test@university.edu

# 3. Test verification endpoint
curl http://localhost:3020/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@oregonstate.edu"}'

# 4. Check backend logs for email delivery confirmation
```
