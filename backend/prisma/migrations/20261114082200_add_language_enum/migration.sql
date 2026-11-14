-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('VI', 'EN');

-- AlterTable
ALTER TABLE "UserPreference" DROP COLUMN "language",
ADD COLUMN "language" "LanguageCode" NOT NULL DEFAULT 'EN';
