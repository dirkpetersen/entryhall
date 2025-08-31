# Woerk Setup Guide

## Prerequisites

### System Requirements
- Ubuntu 24.04 or macOS 14+
- Node.js 20.x or higher
- PostgreSQL 16.9+
- Git
- 8GB RAM minimum
- 10GB free disk space

### Required Software
```bash
# Check versions
node --version  # Should be 20.x or higher
npm --version   # Should be 10.x or higher
psql --version  # Should be 16.9 or higher
```

## Quick Start (Development)

### 1. Clone Repository
```bash
git clone https://github.com/your-org/entryhall.git
cd entryhall
```

### 2. Database Setup
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE woerk;
CREATE USER woerk_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE woerk TO woerk_user;
\q
```

### 3. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

Required values:
```
PORT=3021
DATABASE_URL="postgresql://woerk_user:your_secure_password@localhost:5432/woerk"
JWT_SECRET="generate-a-secure-random-string"
JWT_EXPIRES_IN="7d"
```

#### Frontend (.env.local)
```bash
cd ../frontend
cp .env.example .env.local
# Edit .env.local
```

Required values:
```
NEXT_PUBLIC_API_URL=http://localhost:3021
NEXT_PUBLIC_WS_URL=ws://localhost:3021
```

### 4. Install Dependencies
```bash
# Backend
cd backend
npm install
npx prisma generate

# Frontend
cd ../frontend
npm install
npx prisma generate
```

### 5. Database Migration
```bash
cd backend
npx prisma migrate dev
```

### 6. Start Development Servers
```bash
# From project root
./start-dev.sh

# Or manually:
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 7. Access Application
- Frontend: http://localhost:3020
- Backend API: http://localhost:3021
- API Docs: http://localhost:3021/api-docs

## Production Setup

### 1. Build Applications
```bash
# Frontend
cd frontend
NEXT_TELEMETRY_DISABLED=1 npm run build

# Backend
cd ../backend
npm run build
```

### 2. Production Environment Variables

#### Backend (.env.production)
```
NODE_ENV=production
PORT=3011
DATABASE_URL="postgresql://woerk_user:password@db.example.edu:5432/woerk"
JWT_SECRET="production-secret-key"
JWT_EXPIRES_IN="7d"

# External APIs
GRANTS_GOV_API_KEY="your-api-key"
GROUPER_API_URL="https://grouper.example.edu/grouper-ws"
GROUPER_API_USER="api-user"
GROUPER_API_PASSWORD="api-password"

# Storage
S3_BUCKET="woerk-files"
S3_REGION="us-west-2"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
```

#### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://api.woerk.example.edu
NEXT_PUBLIC_WS_URL=wss://api.woerk.example.edu
```

### 3. Database Production Setup
```bash
# Run migrations
cd backend
npx prisma migrate deploy

# Create indexes for performance
psql -U woerk_user -d woerk
CREATE INDEX idx_users_email ON "User"(email);
CREATE INDEX idx_projects_owner ON "Project"("ownerId");
CREATE INDEX idx_projects_woerk ON "Project"("woerkId");
```

### 4. Start Production Servers
```bash
# Using PM2
npm install -g pm2

# Backend
cd backend
pm2 start dist/main.js --name woerk-backend

# Frontend
cd ../frontend
pm2 start npm --name woerk-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## Docker Setup (Optional)

### 1. Build Images
```bash
docker-compose build
```

### 2. Start Services
```bash
docker-compose up -d
```

### 3. Check Status
```bash
docker-compose ps
docker-compose logs -f
```

## Configuration Files

### nginx.conf (Production)
```nginx
server {
    listen 80;
    server_name woerk.example.edu;
    
    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.woerk.example.edu;
    
    location / {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### systemd Service (Production)
```ini
# /etc/systemd/system/woerk-backend.service
[Unit]
Description=Woerk Backend
After=network.target

[Service]
Type=simple
User=woerk
WorkingDirectory=/opt/woerk/backend
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## Verification Steps

### 1. Check Backend Health
```bash
curl http://localhost:3021/health
# Should return: {"status":"ok"}
```

### 2. Check Database Connection
```bash
cd backend
npx prisma studio
# Opens browser to view database
```

### 3. Test Authentication
```bash
# Register user
curl -X POST http://localhost:3021/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@oregonstate.edu","password":"Test123!"}'
```

### 4. Check Frontend Build
```bash
cd frontend
npm run build
# Should complete without errors
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3020
# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Restart if needed
sudo systemctl restart postgresql
```

### Prisma Client Not Generated
```bash
# Regenerate in both directories
cd backend && npx prisma generate
cd ../frontend && npx prisma generate
```

### Build Failures
```bash
# Clear caches
rm -rf frontend/.next
rm -rf backend/dist
rm -rf node_modules
npm install
```

### Tailwind CSS Issues
```bash
# Ensure using v3, not v4
cd frontend
npm install tailwindcss@3.4.17
```

## Development Tools

### Recommended VS Code Extensions
- Prisma
- ESLint
- Prettier
- TypeScript Hero
- Tailwind CSS IntelliSense

### Database GUI
- pgAdmin 4
- DBeaver
- TablePlus

### API Testing
- Postman
- Insomnia
- Thunder Client (VS Code)

## Security Checklist

- [ ] Change all default passwords
- [ ] Generate secure JWT secret
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Configure firewall rules
- [ ] Set up backup strategy
- [ ] Monitor for security updates

## Support

### Logs Location
- Frontend: `.next/server/logs/`
- Backend: `logs/`
- PM2: `~/.pm2/logs/`

### Getting Help
- Check TECHNICAL.md for architecture details
- Review API-SPEC.md for endpoint documentation
- See WORKFLOWS.md for user flow diagrams
- Submit issues to GitHub repository