/*
  Warnings:

  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - The `provider` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'GITHUB');

-- DropIndex
DROP INDEX "User_isActive_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActive",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "provider",
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL';

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerId_key" ON "User"("provider", "providerId");
