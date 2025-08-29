
PostgreSQL Schema (DDL)

```
based on the requirements claude generated this postgres DB model: 

-- Create custom ENUM types for controlled vocabularies
CREATE TYPE allocation_model_enum AS ENUM ('subscription', 'condo');
CREATE TYPE storage_subtype_enum AS ENUM ('posix', 's3_like', 'database');

-- ======== Core Tables: Users, Security Groups, Resource Types ========

-- Table to store all users, regardless of their role.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- A PI's default project is a property of the user, not the project.
    -- This FK is added later with ALTER TABLE to avoid a circular dependency with 'projects'.
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
    is_storage_type BOOLEAN NOT NULL DEFAULT FALSE
);


-- ======== Project and Allocation Tables ========

-- The central table for projects. Links together PIs, billing, and defaults.
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    pi_owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    -- Using JSONB is flexible for different billing methods (CC info, codes, etc.)
    billing_details JSONB,
    -- The default Data Steward for all data shares in this project (can be overridden).
    default_data_steward_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    -- The default security group for all data shares in this project (can be overridden).
    default_security_group_id INTEGER REFERENCES security_groups(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- A PI cannot have two projects with the same name.
    UNIQUE (pi_owner_id, name)
);

-- Now we can add the default_project_id to the users table.
ALTER TABLE users ADD COLUMN default_project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;
-- Add a constraint to ensure the user owns the project they set as default.
-- This requires a trigger/function to enforce properly or application-level logic.


-- Represents a specific quantity of a resource allocated to a project.
CREATE TABLE allocations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    resource_type_id INTEGER NOT NULL REFERENCES resource_types(id) ON DELETE RESTRICT,
    allocation_model allocation_model_enum NOT NULL,
    quantity NUMERIC(18, 4) NOT NULL CHECK (quantity >= 0),
    -- For 'subscription' this would be the current billing period start/end.
    -- For 'condo' this would be the entire lifetime (e.g., 60 months).
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL
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


-- ======== Indexes for Performance ========

CREATE INDEX idx_projects_pi_owner_id ON projects(pi_owner_id);
CREATE INDEX idx_allocations_project_id ON allocations(project_id);
CREATE INDEX idx_data_shares_project_id ON data_shares(project_id);
CREATE INDEX idx_project_shares_source_id ON project_resource_shares(source_project_id);
CREATE INDEX idx_project_shares_recipient_id ON project_resource_shares(recipient_project_id);
```