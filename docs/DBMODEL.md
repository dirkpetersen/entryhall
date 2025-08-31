# Database Model Documentation

## PostgreSQL Schema (DDL)

```sql
-- Create custom ENUM types for controlled vocabularies
CREATE TYPE allocation_model_enum AS ENUM ('subscription', 'condo');
CREATE TYPE storage_subtype_enum AS ENUM ('posix', 's3_like', 'database');
CREATE TYPE user_role_enum AS ENUM ('faculty', 'staff', 'student', 'external');
CREATE TYPE project_status_enum AS ENUM ('active', 'suspended', 'archived');
CREATE TYPE identity_provider_enum AS ENUM ('google', 'github', 'orcid', 'linkedin', 'azure');

-- ======== Core Tables: Users, Security Groups, Resource Types ========

-- Table to store all users, regardless of their role.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    role user_role_enum NOT NULL,
    title TEXT,
    department TEXT,
    university TEXT,
    -- Default billing information for .edu users
    default_billing_index TEXT,
    default_activity_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_verification_sent TIMESTAMPTZ,
    -- A PI's default project is added later to avoid circular dependency
    -- See ALTER TABLE below
);

-- Linked identity providers (Google, GitHub, ORCID, LinkedIn)
CREATE TABLE user_identities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider identity_provider_enum NOT NULL,
    provider_user_id TEXT NOT NULL,
    provider_email TEXT,
    provider_data JSONB, -- Store additional provider-specific data
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, provider),
    UNIQUE(provider, provider_user_id)
);

-- Manages security groups, which control access to data shares.
CREATE TABLE security_groups (
    id SERIAL PRIMARY KEY,
    group_name TEXT NOT NULL UNIQUE,
    -- The identifier in the external system (e.g., LDAP DN, Grouper name)
    external_system_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A catalog of available resource types on the HPC system.
CREATE TABLE resource_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- e.g., 'CPU Core-Hours', 'Storage TB', 'GPU Hours'
    unit TEXT NOT NULL, -- e.g., 'core-hours/month', 'TB/month', 'tokens'
    -- A flag to easily identify which allocations can be used for data shares.
    is_storage_type BOOLEAN NOT NULL DEFAULT FALSE,
    default_quantity NUMERIC(18, 4) DEFAULT 0,
    max_request_quantity NUMERIC(18, 4)
);

-- ======== Project and Allocation Tables ========

-- The central table for projects. Links together PIs, billing, and defaults.
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    woerk_id TEXT NOT NULL UNIQUE, -- Format: XX-YY (e.g., AB-12)
    name TEXT NOT NULL,  -- Short name, max 30 chars
    description TEXT,    -- Max 1024 chars
    pi_owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status project_status_enum NOT NULL DEFAULT 'active',
    -- Grant information for federal projects
    is_grant_based BOOLEAN DEFAULT FALSE,
    grant_id TEXT,
    grant_agency TEXT,
    grant_data JSONB,
    -- Using JSONB is flexible for different billing methods (CC info, codes, etc.)
    billing_details JSONB,
    -- The default Data Steward for all data shares in this project (can be overridden).
    default_data_steward_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    -- The default security group for all data shares in this project (can be overridden).
    default_security_group_id INTEGER REFERENCES security_groups(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE (pi_owner_id, name),
    CHECK (LENGTH(name) <= 30),
    CHECK (LENGTH(description) <= 1024),
    CHECK (woerk_id ~ '^[A-Z0-9]{2}-[A-Z0-9]{2}$')
);

-- Now we can add the default_project_id to the users table.
ALTER TABLE users ADD COLUMN default_project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;

-- Project members (users associated with projects)
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Represents a specific quantity of a resource allocated to a project.
CREATE TABLE allocations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    resource_type_id INTEGER NOT NULL REFERENCES resource_types(id) ON DELETE RESTRICT,
    allocation_model allocation_model_enum NOT NULL,
    quantity NUMERIC(18, 4) NOT NULL CHECK (quantity >= 0),
    used_quantity NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (used_quantity >= 0),
    -- For 'subscription' this would be the current billing period start/end.
    -- For 'condo' this would be the entire lifetime (e.g., 60 months).
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (used_quantity <= quantity)
);

-- Allocation requests requiring approval
CREATE TABLE allocation_requests (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    resource_type_id INTEGER NOT NULL REFERENCES resource_types(id) ON DELETE RESTRICT,
    requested_quantity NUMERIC(18, 4) NOT NULL CHECK (requested_quantity > 0),
    justification TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_quantity NUMERIC(18, 4),
    approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ
);

-- ======== Data Sharing and Role Management ========

-- Represents a partitioned storage space for collaborative data access.
CREATE TABLE data_shares (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- The specific storage allocation this share is carved out from.
    -- UNIQUE constraint ensures one allocation can't back multiple data shares.
    source_allocation_id INTEGER NOT NULL UNIQUE REFERENCES allocations(id) ON DELETE RESTRICT,
    storage_subtype storage_subtype_enum NOT NULL,
    path TEXT, -- File system path or S3 bucket/prefix
    size_bytes BIGINT DEFAULT 0,
    -- Overrides the project-level default data steward. If NULL, the project's default is used.
    data_steward_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    -- The security group controlling access. Defaults to project's group but can be a custom one.
    security_group_id INTEGER NOT NULL REFERENCES security_groups(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- A project cannot have two data shares with the same name.
    UNIQUE (project_id, name)
);

-- A join table to assign Resource Manager roles to users for specific projects.
CREATE TABLE project_resource_managers (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)
);

-- Manages the sharing of resources between projects.
CREATE TABLE project_resource_shares (
    id SERIAL PRIMARY KEY,
    source_project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    recipient_project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- If NULL, this rule applies to ALL resources from the source project.
    -- If set, it applies only to the specified resource type.
    resource_type_id INTEGER REFERENCES resource_types(id) ON DELETE CASCADE,
    share_percentage NUMERIC(5, 2) NOT NULL CHECK (share_percentage > 0 AND share_percentage <= 99.00),
    
    -- Prevent creating duplicate sharing rules.
    UNIQUE (source_project_id, recipient_project_id, resource_type_id)
);

-- ======== Audit and Activity Logging ========

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage tracking for billing
CREATE TABLE usage_records (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    resource_type_id INTEGER NOT NULL REFERENCES resource_types(id) ON DELETE RESTRICT,
    quantity NUMERIC(18, 4) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======== Indexes for Performance ========

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_default_project ON users(default_project_id);
CREATE INDEX idx_user_identities_user_id ON user_identities(user_id);
CREATE INDEX idx_projects_pi_owner_id ON projects(pi_owner_id);
CREATE INDEX idx_projects_woerk_id ON projects(woerk_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_allocations_project_id ON allocations(project_id);
CREATE INDEX idx_allocations_dates ON allocations(period_start, period_end);
CREATE INDEX idx_allocation_requests_project_id ON allocation_requests(project_id);
CREATE INDEX idx_allocation_requests_status ON allocation_requests(status);
CREATE INDEX idx_data_shares_project_id ON data_shares(project_id);
CREATE INDEX idx_project_shares_source_id ON project_resource_shares(source_project_id);
CREATE INDEX idx_project_shares_recipient_id ON project_resource_shares(recipient_project_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_usage_records_project_id ON usage_records(project_id);
CREATE INDEX idx_usage_records_dates ON usage_records(period_start, period_end);
```

## Sample Data

```sql
-- Insert sample resource types
INSERT INTO resource_types (name, unit, is_storage_type, default_quantity, max_request_quantity) VALUES
('CPU Core-Hours', 'core-hours', FALSE, 100, 10000),
('GPU Hours', 'gpu-hours', FALSE, 20, 1000),
('Storage', 'TB', TRUE, 1, 100),
('Memory', 'GB-hours', FALSE, 500, 50000);

-- Insert sample users
INSERT INTO users (username, full_name, email, email_verified, role, title, department, university) VALUES
('jdoe', 'John Doe', 'jdoe@oregonstate.edu', TRUE, 'faculty', 'Professor', 'Computer Science', 'Oregon State University'),
('asmith', 'Alice Smith', 'asmith@stanford.edu', TRUE, 'staff', 'Research Scientist', 'Biology', 'Stanford University'),
('bchen', 'Bob Chen', 'bchen@mit.edu', FALSE, 'student', 'PhD Candidate', 'Physics', 'MIT');

-- Insert sample projects with Woerk IDs
INSERT INTO projects (woerk_id, name, description, pi_owner_id, is_grant_based, grant_agency) VALUES
('AB-12', 'ML Research', 'Deep learning for climate modeling', 1, TRUE, 'NSF'),
('CD-34', 'Genomics Pipeline', 'Large-scale genomic analysis', 2, FALSE, NULL),
('EF-56', 'Quantum Sim', 'Quantum computing simulations', 3, TRUE, 'DOE');

-- Insert sample allocations
INSERT INTO allocations (project_id, resource_type_id, allocation_model, quantity, period_start, period_end) VALUES
(1, 1, 'subscription', 5000, '2024-01-01', '2024-12-31'),
(1, 2, 'subscription', 100, '2024-01-01', '2024-12-31'),
(1, 3, 'condo', 10, '2024-01-01', '2029-01-01'),
(2, 1, 'subscription', 2000, '2024-01-01', '2024-12-31'),
(2, 3, 'subscription', 5, '2024-01-01', '2024-12-31');

-- Insert sample project members
INSERT INTO project_members (project_id, user_id, role) VALUES
(1, 1, 'owner'),
(1, 2, 'member'),
(2, 2, 'owner'),
(2, 3, 'member'),
(3, 3, 'owner');

-- Insert sample security groups
INSERT INTO security_groups (group_name, external_system_id) VALUES
('project-AB12-users', 'cn=project-AB12-users,ou=groups,dc=osu,dc=edu'),
('project-AB12-admins', 'cn=project-AB12-admins,ou=groups,dc=osu,dc=edu'),
('project-CD34-users', 'cn=project-CD34-users,ou=groups,dc=stanford,dc=edu');
```

## Business Rules Enforcement

### Triggers and Functions

```sql
-- Function to validate user owns their default project
CREATE OR REPLACE FUNCTION validate_user_default_project()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.default_project_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM projects 
            WHERE id = NEW.default_project_id 
            AND pi_owner_id = NEW.id
        ) THEN
            RAISE EXCEPTION 'User can only set their own project as default';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_user_default_project
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION validate_user_default_project();

-- Function to auto-create security groups for new projects
CREATE OR REPLACE FUNCTION create_project_security_groups()
RETURNS TRIGGER AS $$
DECLARE
    users_group_id INTEGER;
    admins_group_id INTEGER;
BEGIN
    -- Create users group
    INSERT INTO security_groups (group_name, external_system_id)
    VALUES (
        'project-' || REPLACE(NEW.woerk_id, '-', '') || '-users',
        'cn=project-' || REPLACE(NEW.woerk_id, '-', '') || '-users,ou=groups,dc=edu'
    ) RETURNING id INTO users_group_id;
    
    -- Create admins group
    INSERT INTO security_groups (group_name, external_system_id)
    VALUES (
        'project-' || REPLACE(NEW.woerk_id, '-', '') || '-admins',
        'cn=project-' || REPLACE(NEW.woerk_id, '-', '') || '-admins,ou=groups,dc=edu'
    ) RETURNING id INTO admins_group_id;
    
    -- Set default security group if not set
    IF NEW.default_security_group_id IS NULL THEN
        NEW.default_security_group_id := users_group_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_project_groups
BEFORE INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION create_project_security_groups();

-- Function to enforce 99% maximum resource sharing
CREATE OR REPLACE FUNCTION validate_resource_sharing()
RETURNS TRIGGER AS $$
DECLARE
    total_shared NUMERIC;
BEGIN
    SELECT COALESCE(SUM(share_percentage), 0) INTO total_shared
    FROM project_resource_shares
    WHERE source_project_id = NEW.source_project_id
    AND (resource_type_id = NEW.resource_type_id OR 
         (resource_type_id IS NULL AND NEW.resource_type_id IS NULL))
    AND id != COALESCE(NEW.id, -1);
    
    IF total_shared + NEW.share_percentage > 99.00 THEN
        RAISE EXCEPTION 'Total resource sharing cannot exceed 99%%';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_resource_sharing_limit
BEFORE INSERT OR UPDATE ON project_resource_shares
FOR EACH ROW
EXECUTE FUNCTION validate_resource_sharing();

-- Function to track allocation usage
CREATE OR REPLACE FUNCTION update_allocation_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE allocations
    SET used_quantity = used_quantity + NEW.quantity
    WHERE project_id = NEW.project_id
    AND resource_type_id = NEW.resource_type_id
    AND NOW() BETWEEN period_start AND period_end;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_usage_records
AFTER INSERT ON usage_records
FOR EACH ROW
EXECUTE FUNCTION update_allocation_usage();

-- Function to generate unique Woerk ID
CREATE OR REPLACE FUNCTION generate_woerk_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate format: XX-YY where X is letter, Y is alphanumeric
        new_id := CHR(65 + FLOOR(RANDOM() * 26)::INT) || 
                  CHR(65 + FLOOR(RANDOM() * 26)::INT) || '-' ||
                  CHR(65 + FLOOR(RANDOM() * 26)::INT) || 
                  CASE WHEN RANDOM() < 0.5 
                       THEN CHR(65 + FLOOR(RANDOM() * 26)::INT)
                       ELSE CHR(48 + FLOOR(RANDOM() * 10)::INT)
                  END;
        
        SELECT COUNT(*) INTO exists_count 
        FROM projects WHERE woerk_id = new_id;
        
        EXIT WHEN exists_count = 0;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;
```

## Query Examples

### Common Queries

```sql
-- Get user's projects with member count and resource usage
SELECT 
    p.*,
    COUNT(DISTINCT pm.user_id) as member_count,
    COALESCE(SUM(a.used_quantity), 0) as total_usage
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN allocations a ON p.id = a.project_id
WHERE p.pi_owner_id = $1 OR pm.user_id = $1
GROUP BY p.id
ORDER BY p.created_at DESC;

-- Get project's available resources
SELECT 
    rt.name,
    rt.unit,
    a.quantity,
    a.used_quantity,
    (a.quantity - a.used_quantity) as available,
    a.period_end
FROM allocations a
JOIN resource_types rt ON a.resource_type_id = rt.id
WHERE a.project_id = $1
AND NOW() BETWEEN a.period_start AND a.period_end;

-- Get pending allocation requests for approval
SELECT 
    ar.*,
    p.woerk_id,
    p.name as project_name,
    u.full_name as requester_name,
    rt.name as resource_name
FROM allocation_requests ar
JOIN projects p ON ar.project_id = p.id
JOIN users u ON p.pi_owner_id = u.id
JOIN resource_types rt ON ar.resource_type_id = rt.id
WHERE ar.status = 'pending'
ORDER BY ar.requested_at;

-- Audit trail for a project
SELECT 
    al.*,
    u.full_name as user_name
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.entity_type = 'project'
AND al.entity_id = $1
ORDER BY al.created_at DESC
LIMIT 100;
```

## Migration Notes

### From Legacy System
- Map old user IDs to new format
- Convert billing codes to JSONB structure
- Migrate existing allocations with proper period dates
- Generate Woerk IDs for existing projects
- Create security groups for all projects

### Data Retention
- Audit logs: Keep for 7 years
- Usage records: Keep for 3 years
- Archived projects: Soft delete, keep for 1 year
- User data: Anonymize after 2 years of inactivity