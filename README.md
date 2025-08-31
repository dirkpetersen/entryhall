# Woerk

Comprehensive resource management platform for university supercomputer facilities, providing self-service user and project management, resource allocation and tracking, multi-university federation support, and integration with research infrastructure.

## 🚀 Quick Start

See **[docs/SETUP.md](./docs/SETUP.md)** for complete installation instructions.

## 📚 Documentation

### Core Documentation
- **[TECHNICAL.md](./docs/TECHNICAL.md)** - Technology stack, architecture, compatibility notes
- **[API-SPEC.md](./docs/API-SPEC.md)** - Complete API documentation and endpoints
- **[SETUP.md](./docs/SETUP.md)** - Installation and deployment instructions
- **[WORKFLOWS.md](./docs/WORKFLOWS.md)** - User flows and business logic

### Requirements & Design
- **[REQUIRED.md](./docs/REQUIRED.md)** - Business requirements and acceptance criteria
- **[DBMODEL.md](./docs/DBMODEL.md)** - Database schema and relationships

### Development Reference
- **[CLAUDE.md](./CLAUDE.md)** - Quick reference for Claude Code development
- **[.env.default](./.env.default)** - Complete environment variable reference

## 🏗️ Architecture

- **Frontend**: Next.js 15.5.2, TypeScript, Tailwind CSS 3.4.17
- **Backend**: NestJS with Express, Prisma ORM
- **Database**: PostgreSQL 16.9 with JSONB support
- **Authentication**: JWT with Passport
- **Terminal**: xterm.js 5.5.0

## 🔧 Development

### Port Configuration
- **Development**: Frontend 3020, Backend 3021
- **Production**: Frontend 3010, Backend 3011

### Quick Commands
```bash
# Start development servers
./start-dev.sh

# Start production servers  
./start-prod.sh

# Restart with updated code
./restart.sh
```

## 📋 Features

- ✅ Multi-tab interface (User Account, Resources, Groups, Files, Terminal, GitHub)
- ✅ Project/Woerk management with auto-generated IDs
- ✅ Resource allocation models (subscription & condo)
- ✅ SSH terminal integration
- ✅ Multi-university federation support
- ✅ Integration with grants.gov, LDAP, GitHub
- 🚧 File management (planned)
- 🚧 Authorization groups (planned)
- 🚧 Background jobs with pg-boss (planned)

## 🤝 Contributing

Please refer to the documentation in the `docs/` folder for development guidelines and technical specifications.