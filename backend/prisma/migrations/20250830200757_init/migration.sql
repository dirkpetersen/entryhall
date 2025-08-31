-- CreateEnum
CREATE TYPE "public"."AllocationModel" AS ENUM ('subscription', 'condo');

-- CreateEnum
CREATE TYPE "public"."StorageSubtype" AS ENUM ('posix', 's3_like', 'database');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('staff', 'professional_faculty', 'faculty');

-- CreateEnum
CREATE TYPE "public"."LinkedAccountType" AS ENUM ('google', 'github', 'orcid', 'linkedin');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "password_hash" TEXT,
    "title" TEXT,
    "position" TEXT,
    "role" "public"."UserRole",
    "university" TEXT,
    "department" TEXT,
    "default_index" TEXT,
    "default_activity_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "default_project_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."linked_accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_type" "public"."LinkedAccountType" NOT NULL,
    "email" TEXT,
    "external_id" TEXT NOT NULL,
    "external_num_id" BIGINT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linked_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."security_groups" (
    "id" SERIAL NOT NULL,
    "group_name" TEXT NOT NULL,
    "external_system_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "is_storage_type" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "resource_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" SERIAL NOT NULL,
    "woerk_id" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "description" TEXT,
    "pi_owner_id" INTEGER NOT NULL,
    "billing_details" JSONB,
    "default_data_steward_id" INTEGER,
    "default_security_group_id" INTEGER,
    "is_grant_project" BOOLEAN NOT NULL DEFAULT false,
    "grant_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."allocations" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "resource_type_id" INTEGER NOT NULL,
    "allocation_model" "public"."AllocationModel" NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."data_shares" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,
    "source_allocation_id" INTEGER NOT NULL,
    "storage_subtype" "public"."StorageSubtype" NOT NULL,
    "data_steward_id" INTEGER,
    "security_group_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_resource_managers" (
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "project_resource_managers_pkey" PRIMARY KEY ("project_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."project_resource_shares" (
    "id" SERIAL NOT NULL,
    "source_project_id" INTEGER NOT NULL,
    "recipient_project_id" INTEGER NOT NULL,
    "resource_type_id" INTEGER,
    "share_percentage" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "project_resource_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "linked_accounts_user_id_account_type_key" ON "public"."linked_accounts"("user_id", "account_type");

-- CreateIndex
CREATE UNIQUE INDEX "security_groups_group_name_key" ON "public"."security_groups"("group_name");

-- CreateIndex
CREATE UNIQUE INDEX "security_groups_external_system_id_key" ON "public"."security_groups"("external_system_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_types_name_key" ON "public"."resource_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "projects_woerk_id_key" ON "public"."projects"("woerk_id");

-- CreateIndex
CREATE INDEX "projects_pi_owner_id_idx" ON "public"."projects"("pi_owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_pi_owner_id_short_name_key" ON "public"."projects"("pi_owner_id", "short_name");

-- CreateIndex
CREATE INDEX "allocations_project_id_idx" ON "public"."allocations"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_shares_source_allocation_id_key" ON "public"."data_shares"("source_allocation_id");

-- CreateIndex
CREATE INDEX "data_shares_project_id_idx" ON "public"."data_shares"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_shares_project_id_name_key" ON "public"."data_shares"("project_id", "name");

-- CreateIndex
CREATE INDEX "project_resource_shares_source_project_id_idx" ON "public"."project_resource_shares"("source_project_id");

-- CreateIndex
CREATE INDEX "project_resource_shares_recipient_project_id_idx" ON "public"."project_resource_shares"("recipient_project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_resource_shares_source_project_id_recipient_project_key" ON "public"."project_resource_shares"("source_project_id", "recipient_project_id", "resource_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "public"."accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "public"."sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_default_project_id_fkey" FOREIGN KEY ("default_project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."linked_accounts" ADD CONSTRAINT "linked_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_pi_owner_id_fkey" FOREIGN KEY ("pi_owner_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_default_data_steward_id_fkey" FOREIGN KEY ("default_data_steward_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_default_security_group_id_fkey" FOREIGN KEY ("default_security_group_id") REFERENCES "public"."security_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allocations" ADD CONSTRAINT "allocations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allocations" ADD CONSTRAINT "allocations_resource_type_id_fkey" FOREIGN KEY ("resource_type_id") REFERENCES "public"."resource_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_shares" ADD CONSTRAINT "data_shares_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_shares" ADD CONSTRAINT "data_shares_source_allocation_id_fkey" FOREIGN KEY ("source_allocation_id") REFERENCES "public"."allocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_shares" ADD CONSTRAINT "data_shares_data_steward_id_fkey" FOREIGN KEY ("data_steward_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_shares" ADD CONSTRAINT "data_shares_security_group_id_fkey" FOREIGN KEY ("security_group_id") REFERENCES "public"."security_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_resource_managers" ADD CONSTRAINT "project_resource_managers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_resource_managers" ADD CONSTRAINT "project_resource_managers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_resource_shares" ADD CONSTRAINT "project_resource_shares_source_project_id_fkey" FOREIGN KEY ("source_project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_resource_shares" ADD CONSTRAINT "project_resource_shares_recipient_project_id_fkey" FOREIGN KEY ("recipient_project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_resource_shares" ADD CONSTRAINT "project_resource_shares_resource_type_id_fkey" FOREIGN KEY ("resource_type_id") REFERENCES "public"."resource_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
