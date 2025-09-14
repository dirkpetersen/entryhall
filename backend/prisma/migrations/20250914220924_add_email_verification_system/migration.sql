/*
  Warnings:

  - The `email_verified` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `role` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."IdentityProvider" AS ENUM ('google', 'github', 'orcid', 'linkedin', 'azure');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "password_reset_token" TEXT,
ADD COLUMN     "password_reset_token_expires" TIMESTAMP(3),
ADD COLUMN     "verification_token" TEXT,
ADD COLUMN     "verification_token_expires" TIMESTAMP(3),
DROP COLUMN "email_verified",
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'staff';

-- CreateTable
CREATE TABLE "public"."user_identities" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "public"."IdentityProvider" NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "provider_email" TEXT,
    "provider_data" JSONB,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_identities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_identities_user_id_provider_key" ON "public"."user_identities"("user_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "user_identities_provider_provider_user_id_key" ON "public"."user_identities"("provider", "provider_user_id");

-- AddForeignKey
ALTER TABLE "public"."user_identities" ADD CONSTRAINT "user_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
