# API Specification

## Base URLs
- Development: `http://localhost:3021/api`
- Production: `https://api.woerk.example.edu/api`

## Authentication

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.edu",
  "roles": ["staff", "faculty"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## REST API Endpoints

### Authentication (`/api/auth`)

#### POST `/auth/register`
Register new user account
```json
// Request
{
  "email": "user@oregonstate.edu",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "title": "Research Assistant",
  "role": "staff",
  "department": "Computer Science"
}

// Response
{
  "id": "uuid",
  "email": "user@oregonstate.edu",
  "emailVerified": false,
  "verificationToken": "token"
}
```

#### POST `/auth/login`
Authenticate user
```json
// Request
{
  "email": "user@oregonstate.edu",
  "password": "SecurePassword123!"
}

// Response
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@oregonstate.edu",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### POST `/auth/verify-email`
Verify email address
```json
// Request
{
  "token": "verification_token"
}

// Response
{
  "message": "Email verified successfully"
}
```

#### POST `/auth/link-identity`
Link external identity provider
```json
// Request
{
  "provider": "google|github|orcid|linkedin",
  "accessToken": "provider_access_token"
}

// Response
{
  "provider": "google",
  "providerId": "google_user_id",
  "email": "user@gmail.com",
  "linked": true
}
```

### Users (`/api/users`)

#### GET `/users/profile`
Get current user profile
```json
// Response
{
  "id": "uuid",
  "email": "user@oregonstate.edu",
  "firstName": "John",
  "lastName": "Doe",
  "title": "Research Assistant",
  "role": "staff",
  "department": "Computer Science",
  "university": "Oregon State University",
  "linkedIdentities": [
    {
      "provider": "google",
      "email": "user@gmail.com",
      "id": "google_123456"
    }
  ],
  "defaultBilling": {
    "index": "123456",
    "activityCode": "ABC123"
  }
}
```

#### PUT `/users/profile`
Update user profile
```json
// Request
{
  "title": "Senior Research Assistant",
  "department": "Computer Science",
  "defaultBilling": {
    "index": "654321",
    "activityCode": "XYZ789"
  }
}
```

### Projects/Woerks (`/api/projects`)

#### GET `/projects`
List user's projects
```json
// Query params: ?page=1&limit=20&search=keyword

// Response
{
  "data": [
    {
      "id": "uuid",
      "woerkId": "AB-12",
      "shortName": "ML Research",
      "description": "Machine learning research project",
      "type": "grant",
      "owner": "user_id",
      "created": "2024-01-01T00:00:00Z",
      "grantInfo": {
        "agency": "NSF",
        "grantId": "1234567"
      }
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

#### POST `/projects`
Create new project
```json
// Request
{
  "shortName": "ML Research",
  "description": "Machine learning research project",
  "type": "non-grant|grant",
  "grantId": "optional_grant_id"
}

// Response
{
  "id": "uuid",
  "woerkId": "AB-12",  // Auto-generated
  "shortName": "ML Research",
  "description": "Machine learning research project"
}
```

#### GET `/projects/:woerkId`
Get project details
```json
// Response
{
  "id": "uuid",
  "woerkId": "AB-12",
  "shortName": "ML Research",
  "description": "Machine learning research project",
  "owner": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@oregonstate.edu"
  },
  "members": [
    {
      "userId": "uuid",
      "role": "member|admin",
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "allocations": [
    {
      "resource": "GPU",
      "amount": 100,
      "unit": "hours"
    }
  ]
}
```

### Allocations (`/api/allocations`)

#### GET `/allocations/:projectId`
Get project allocations
```json
// Response
{
  "projectId": "uuid",
  "allocations": [
    {
      "id": "uuid",
      "resource": "GPU",
      "total": 1000,
      "used": 250,
      "available": 750,
      "unit": "hours",
      "expires": "2024-12-31T23:59:59Z"
    }
  ]
}
```

#### POST `/allocations/request`
Request new allocation
```json
// Request
{
  "projectId": "uuid",
  "resource": "GPU",
  "amount": 500,
  "unit": "hours",
  "justification": "Need for training large models"
}

// Response
{
  "id": "uuid",
  "status": "pending",
  "requestedAmount": 500,
  "approvedAmount": null
}
```

### Groups (`/api/groups`)

#### GET `/groups/:projectId`
List project groups
```json
// Response
{
  "projectId": "uuid",
  "groups": [
    {
      "id": "uuid",
      "name": "project-AB12-users",
      "description": "User group for project AB-12",
      "memberCount": 5,
      "ldapDn": "cn=project-AB12-users,ou=groups,dc=example,dc=edu"
    }
  ]
}
```

#### POST `/groups`
Create new group
```json
// Request
{
  "projectId": "uuid",
  "name": "project-AB12-admins",
  "description": "Admin group for project AB-12"
}

// Response
{
  "id": "uuid",
  "name": "project-AB12-admins",
  "ldapDn": "cn=project-AB12-admins,ou=groups,dc=example,dc=edu"
}
```

### Files (`/api/files`)

#### GET `/files/list`
List files in directory
```json
// Query params: ?path=/projects/AB-12&storage=posix|s3

// Response
{
  "path": "/projects/AB-12",
  "files": [
    {
      "name": "data.csv",
      "type": "file",
      "size": 1024000,
      "modified": "2024-01-01T12:00:00Z",
      "permissions": "rw-r--r--"
    }
  ]
}
```

#### POST `/files/upload`
Upload file (multipart/form-data)
```
POST /api/files/upload
Content-Type: multipart/form-data

path: /projects/AB-12
storage: posix
file: <binary_data>
```

#### GET `/files/download`
Download file
```
GET /api/files/download?path=/projects/AB-12/data.csv&storage=posix
```

### Terminal (`/api/terminal`)

#### WebSocket `/terminal/connect`
SSH terminal WebSocket connection
```javascript
// Client
const ws = new WebSocket('ws://localhost:3021/terminal/connect');
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token'
}));

// Server messages
{
  "type": "data",
  "data": "terminal_output"
}

// Client messages
{
  "type": "input",
  "data": "ls -la\n"
}
```

## External API Integrations

### Grants.gov API
```javascript
// Search grants
GET https://www.grants.gov/api/common/search2
?keyword=machine+learning
&oppStatus=open

// Get opportunity details
GET https://www.grants.gov/api/common/fetchopportunity
?oppId=12345
```

### Grouper REST API
```javascript
// Base URL
https://grouper.example.edu/grouper-ws/servicesRest/v2_5_000

// Create group
PUT /groups/project:AB-12:users
{
  "WsRestGroupSaveRequest": {
    "wsGroup": {
      "name": "project:AB-12:users",
      "displayExtension": "Project AB-12 Users"
    }
  }
}

// Add member
PUT /groups/project:AB-12:users/members/john.doe
{
  "WsRestAddMemberRequest": {
    "subjectId": "john.doe",
    "subjectSourceId": "ldap"
  }
}
```

### GitHub API
```javascript
// Get user repos
GET https://api.github.com/user/repos
Authorization: Bearer github_token

// Get repo details
GET https://api.github.com/repos/{owner}/{repo}
```

## WebSocket Events

### Connection
```javascript
// Client -> Server
{
  "event": "connect",
  "data": {
    "token": "jwt_token"
  }
}

// Server -> Client
{
  "event": "connected",
  "data": {
    "userId": "uuid",
    "sessionId": "session_id"
  }
}
```

### Real-time Updates
```javascript
// Project update
{
  "event": "project:updated",
  "data": {
    "projectId": "uuid",
    "changes": {
      "description": "Updated description"
    }
  }
}

// Allocation change
{
  "event": "allocation:changed",
  "data": {
    "projectId": "uuid",
    "resource": "GPU",
    "used": 300,
    "available": 700
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid .edu email"
      }
    ]
  },
  "statusCode": 400,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or missing token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input
- `CONFLICT` (409): Resource already exists
- `RATE_LIMITED` (429): Too many requests
- `SERVER_ERROR` (500): Internal server error

## Rate Limiting
- Default: 100 requests per minute per user
- File uploads: 10 per minute
- Terminal connections: 5 concurrent per user

## Pagination
All list endpoints support:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (e.g., "created", "-modified")
- `search`: Search query

## Filtering
List endpoints support filters:
- `?status=active,pending`
- `?created_after=2024-01-01`
- `?owner=user_id`