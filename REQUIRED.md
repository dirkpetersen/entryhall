# Business Requirements & Acceptance Criteria

## High-Level Summary

This document outlines the resource and data management requirements for a High-Performance Computing (HPC) system. The system allocates compute and storage resources to **Projects**, which are owned by **Principal Investigators (PIs)**. The framework includes distinct resource allocation models, a **Default Project** system for overdrafts, and a flexible **Resource Sharing** mechanism. It also defines key user roles—the **Resource Manager** and the **Data Steward**—to delegate management of project allocations and secure **Data Shares**, respectively.

## 1. Key Concepts

### User Roles
- **Principal Investigator (PI):** The primary user role. A PI is the owner of one or more Projects and is ultimately responsible for their funding and management.
- **Project:** The central unit for organizing work. Each Project is owned by a PI, linked to a billing method, and has a specific allocation of resources.
- **Resource Manager:** A user assigned to a Project with permissions to manage its resource allocations, budgets, and sharing configurations. If this role is not explicitly assigned, the PI serves as the default Resource Manager.
- **Data Steward:** A user (often a staff scientist) responsible for managing the data and access controls for a specific **Data Share**. The Data Steward role has a clear hierarchy for how it is assigned.

### System Components
- **Data Share:** A partitioned space within a Project's storage allocation, linked to a specific security group and managed by a Data Steward. It provides a mechanism for secure, controlled data collaboration.
- **Resources:** The consumable assets on the HPC system, such as:
  - CPU Core-Hours
  - Terabytes (TB) of storage per month (e.g., S3-like, POSIX, database)
  - GPU Hours
  - Software license tokens per month
- **Allocation:** The amount of a resource assigned to a Project for a specific time frame.
- **Woerk ID:** A unique 5-character project identifier (format: XX-YY, e.g., AB-12)

## 2. Core Requirements

### 2.1. Project and PI Management

#### Requirements
- Each Project must be owned by exactly one PI
- A PI can own multiple Projects
- Every Project must be linked to a valid payment method for billing purposes
- Projects must have a unique Woerk ID (format: XX-YY)

#### Acceptance Criteria
- [ ] System prevents creating a project without a PI owner
- [ ] System allows PIs to create and manage multiple projects
- [ ] System validates billing information before project activation
- [ ] System generates unique Woerk IDs automatically
- [ ] System prevents duplicate Woerk IDs

### 2.2. Resource Allocation Models

Resources are allocated to Projects in one of two ways:

#### Subscription Model
- **Description:** A specific quantity of a resource is allocated for a recurring time frame
- **Example:** 10,000 CPU core-hours per month; 50 TB of storage per month

#### Ownership Model (Condo)
- **Description:** A fixed quantity of a resource is purchased outright and allocated for a long-term duration
- **Example:** A purchased compute node grants the Project exclusive access to its cores and RAM for a 60-month period

#### Acceptance Criteria
- [ ] System supports both subscription and condo allocation models
- [ ] System tracks allocation periods correctly
- [ ] System prevents over-allocation of resources
- [ ] System automatically renews subscription allocations
- [ ] System enforces condo allocation expiration dates

### 2.3. The "Default Project" Mechanism

This mechanism acts as a safety net for a PI's projects.

#### Requirements
- A PI can designate **one** of their Projects as their "Default Project"
- If a non-default Project has insufficient allocation, the system automatically draws from the Default Project
- This only occurs if the Default Project has sufficient allocation
- Without a Default Project, jobs from projects with insufficient resources will fail

#### Acceptance Criteria
- [ ] PI can designate exactly one default project
- [ ] System validates PI owns the default project
- [ ] Resource overflow automatically draws from default project
- [ ] System logs all overflow transactions
- [ ] Jobs fail gracefully when no default project exists
- [ ] UI clearly shows default project status

### 2.4. Resource Sharing Mechanism

This mechanism allows for collaboration by letting projects share their allocations.

#### Requirements
- Any Project can share resources with other Projects
- Maximum sharing limit: **99%** (must retain at least 1%)
- Two sharing modes: Uniform and Granular

#### Uniform Sharing (Default)
- Single percentage applied to all shared resources
- Example: 20% sharing = 20% of CPU, storage, and tokens

#### Granular Sharing (Configurable)
- Different percentages for each resource type
- Example: 10% CPU, 50% storage, 0% tokens

#### Acceptance Criteria
- [ ] System enforces 99% maximum sharing limit
- [ ] System prevents sharing 100% of any resource
- [ ] Uniform sharing applies same percentage to all resources
- [ ] Granular sharing allows per-resource configuration
- [ ] Shared resources appear in recipient project's available resources
- [ ] System tracks resource usage against original owner
- [ ] Sharing rules can be modified by Resource Manager
- [ ] System prevents circular sharing dependencies

### 2.5. User Roles and Responsibilities

#### Resource Manager Role

**Purpose:** Manage resource allocations and sharing rules for a specific Project

**Assignment Rules:**
- Can be assigned to any user on a per-project basis
- If not assigned, PI automatically assumes this role

**Permissions:**
- Create/modify resource allocations
- Configure resource sharing rules
- View usage reports
- Request additional allocations

#### Acceptance Criteria
- [ ] System allows assigning Resource Manager per project
- [ ] PI automatically becomes Resource Manager if none assigned
- [ ] Resource Manager can modify allocations within limits
- [ ] Resource Manager actions are logged in audit trail
- [ ] UI shows current Resource Manager for each project

#### Data Steward Role

**Purpose:** Manage data lifecycle and access control for Data Shares

**Assignment Hierarchy (in order of precedence):**
1. **Data Share Level:** User assigned to specific Data Share
2. **Project Level:** Default Data Steward for entire Project
3. **PI as Fallback:** PI serves as Data Steward if none assigned

**Permissions:**
- Manage security group membership
- Create/delete Data Shares
- Set data retention policies
- Export data access logs

#### Acceptance Criteria
- [ ] System follows Data Steward hierarchy correctly
- [ ] Data Share level assignment overrides Project level
- [ ] PI automatically becomes Data Steward if none assigned
- [ ] Data Steward can manage security group membership
- [ ] System logs all Data Steward actions

### 2.6. Data Share Management

Projects can partition storage allocations into discrete **Data Shares** for secure collaboration.

#### Key Properties
- Created from a single storage-type resource allocation
- Has defined storage sub-type (S3-like, database, POSIX)
- Maximum size equals parent storage allocation
- Access controlled by security group

#### Security and Access Control

**Automatic Group Creation:**
- System creates default security group for new Projects
- Format: `project-{woerkId}-users`

**Access Control Hierarchy:**
1. Default: Project-level security group
2. Custom: Share-specific security group (optional)

#### Creation Workflow
1. Select parent Project
2. Choose storage-type resource allocation
3. System sets quota to full allocation size
4. System assigns project's default security group
5. Data Steward determined by hierarchy

#### Acceptance Criteria
- [ ] System auto-creates security groups for new projects
- [ ] Data Shares inherit project security group by default
- [ ] Data Steward can create share-specific security groups
- [ ] System enforces storage quotas
- [ ] Data Shares cannot exceed parent allocation size
- [ ] Access control changes take effect immediately
- [ ] System supports POSIX, S3, and database storage types

## 3. User Experience Requirements

### 3.1. Authentication & Registration

#### Federated Universities
- Auto-detect based on email domain
- Redirect to university SSO (Azure AD, SAML)
- Auto-provision account after first login

#### Non-Federated .edu Users
- Email/password authentication
- Email verification required
- Regular re-verification (admin configurable)

#### External Users (non-.edu)
- Require LinkedIn verification
- Manual approval process
- Additional identity verification

#### Acceptance Criteria
- [ ] System detects federated domains automatically
- [ ] SSO integration works for configured universities
- [ ] Email verification emails sent successfully
- [ ] Re-verification reminders sent on schedule
- [ ] LinkedIn OAuth integration functional
- [ ] Admin approval queue for external users

### 3.2. Identity Linking

Users can link additional identities:
- Google Account (store email and numeric ID)
- GitHub Account (store username and numeric ID)
- ORCID (researcher identification)
- LinkedIn (required for non-.edu users)

#### Acceptance Criteria
- [ ] OAuth flows work for all providers
- [ ] System stores provider IDs securely
- [ ] Users can unlink identities
- [ ] Linked identities appear in user profile
- [ ] System prevents duplicate identity links

### 3.3. Billing Configuration

#### For .edu Users
- Default Index (billing account) - required
- Default Activity Code - required
- Cannot create Woerk IDs without billing info

#### Acceptance Criteria
- [ ] System validates billing information format
- [ ] Project creation blocked without billing info
- [ ] Billing info can be updated by PI
- [ ] System tracks billing per project

## 4. Integration Requirements

### 4.1. Grants.gov Integration

For U.S. Federal Projects:
- Search grants via API
- Multi-word search capability
- Store grant metadata locally
- API endpoints:
  - `https://www.grants.gov/api/common/search2`
  - `https://www.grants.gov/api/common/fetchopportunity`

#### Acceptance Criteria
- [ ] Grant search returns relevant results
- [ ] Grant metadata stored with project
- [ ] System handles API errors gracefully
- [ ] Search supports multiple keywords

### 4.2. LDAP/Grouper Integration

- Create groups in external system
- Sync membership changes
- Support for hierarchical groups
- Real-time or batch synchronization

#### Acceptance Criteria
- [ ] Groups created in LDAP/Grouper successfully
- [ ] Membership changes propagate within 5 minutes
- [ ] System handles sync failures gracefully
- [ ] Audit log tracks all group changes

### 4.3. Storage Integration

Support multiple storage backends:
- POSIX filesystem
- S3-compatible object storage
- Database storage

#### Acceptance Criteria
- [ ] Files upload to correct storage backend
- [ ] Download links work for all storage types
- [ ] System enforces storage quotas
- [ ] File permissions respected for POSIX

### 4.4. SSH Terminal Access

- WebSocket-based terminal (xterm.js)
- Certificate-based authentication
- Session recording for audit
- Configurable session limits

#### Acceptance Criteria
- [ ] Terminal connects to bastion host
- [ ] SSH certificates generated correctly
- [ ] Sessions terminate after timeout
- [ ] Audit logs capture session activity

## 5. Performance Requirements

### Response Times
- Page load: < 2 seconds
- API responses: < 500ms
- File uploads: > 10MB/s
- Terminal latency: < 100ms

### Scalability
- Support 10,000+ concurrent users
- Handle 1,000+ projects
- Manage 100TB+ storage
- Process 1M+ API requests/day

#### Acceptance Criteria
- [ ] Load tests pass with target metrics
- [ ] System scales horizontally
- [ ] Database queries optimized with indexes
- [ ] Caching reduces database load

## 6. Security Requirements

### Authentication
- Multi-factor authentication support
- Session timeout after inactivity
- Password complexity requirements
- Account lockout after failed attempts

### Authorization
- Role-based access control (RBAC)
- Project-level permissions
- Data Share access control
- API token management

### Audit
- All actions logged with timestamp
- User identification in logs
- Data access tracking
- Log retention for 7 years

#### Acceptance Criteria
- [ ] MFA can be enabled per user
- [ ] Sessions expire after 30 minutes idle
- [ ] Passwords require 12+ characters
- [ ] Account locks after 5 failed attempts
- [ ] RBAC prevents unauthorized access
- [ ] Audit logs capture all critical actions
- [ ] Logs stored securely and immutably

## 7. Compliance Requirements

### Data Privacy
- GDPR compliance for EU users
- FERPA compliance for student data
- HIPAA readiness for health research
- Export control compliance

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode

#### Acceptance Criteria
- [ ] Privacy policy covers GDPR requirements
- [ ] Data deletion requests honored within 30 days
- [ ] UI passes accessibility audit
- [ ] All interactive elements keyboard accessible

## 8. Monitoring & Reporting

### System Monitoring
- Resource utilization tracking
- Performance metrics collection
- Error rate monitoring
- Availability tracking (99.9% target)

### User Reports
- Project resource usage
- Billing summaries
- Allocation forecasts
- Audit reports

#### Acceptance Criteria
- [ ] Monitoring dashboard shows real-time metrics
- [ ] Alerts trigger for critical issues
- [ ] Reports exportable in CSV/PDF
- [ ] Usage data accurate within 5 minutes

## 9. Disaster Recovery

### Backup Requirements
- Daily database backups
- File storage replication
- Configuration backups
- 30-day retention minimum

### Recovery Targets
- RPO (Recovery Point Objective): 24 hours
- RTO (Recovery Time Objective): 4 hours
- Data integrity verification
- Disaster recovery testing quarterly

#### Acceptance Criteria
- [ ] Automated daily backups run successfully
- [ ] Backup restoration tested monthly
- [ ] DR plan documented and accessible
- [ ] Failover process takes < 4 hours

## 10. User Support

### Documentation
- User guide for all features
- API documentation
- Administrator manual
- Video tutorials

### Support Channels
- In-app help system
- Email support queue
- Knowledge base
- Community forum

#### Acceptance Criteria
- [ ] Documentation covers all user workflows
- [ ] API docs include examples
- [ ] Help system context-sensitive
- [ ] Support tickets answered within 24 hours