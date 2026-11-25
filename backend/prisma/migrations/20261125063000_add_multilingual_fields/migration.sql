-- AlterTable Category
ALTER TABLE "Category" ADD COLUMN "nameVi" TEXT;
ALTER TABLE "Category" ADD COLUMN "nameEn" TEXT;

-- Backfill data for Category
UPDATE "Category" SET "nameVi" = "name", "nameEn" = "name" WHERE "nameVi" IS NULL;

UPDATE "Category" SET "nameEn" = 'Food & Dining' WHERE "nameVi" = 'Ăn uống';
UPDATE "Category" SET "nameEn" = 'Shopping' WHERE "nameVi" = 'Mua sắm';
UPDATE "Category" SET "nameEn" = 'Housing' WHERE "nameVi" = 'Nhà cửa';
UPDATE "Category" SET "nameEn" = 'Transportation' WHERE "nameVi" = 'Di chuyển';
UPDATE "Category" SET "nameEn" = 'Entertainment' WHERE "nameVi" = 'Giải trí';
UPDATE "Category" SET "nameEn" = 'Healthcare' WHERE "nameVi" = 'Sức khỏe';
UPDATE "Category" SET "nameEn" = 'Education' WHERE "nameVi" = 'Giáo dục';
UPDATE "Category" SET "nameEn" = 'Bills & Utilities' WHERE "nameVi" = 'Hóa đơn';
UPDATE "Category" SET "nameEn" = 'Salary' WHERE "nameVi" = 'Lương';
UPDATE "Category" SET "nameEn" = 'Bonus' WHERE "nameVi" = 'Thưởng';
UPDATE "Category" SET "nameEn" = 'Investment' WHERE "nameVi" = 'Đầu tư';
UPDATE "Category" SET "nameEn" = 'Business' WHERE "nameVi" = 'Kinh doanh';
UPDATE "Category" SET "nameEn" = 'Other' WHERE "nameVi" = 'Khác';

UPDATE "Category" SET "nameEn" = "nameVi" WHERE "nameEn" IS NULL;

ALTER TABLE "Category" ALTER COLUMN "nameVi" SET NOT NULL;
ALTER TABLE "Category" ALTER COLUMN "nameEn" SET NOT NULL;

DROP INDEX IF EXISTS "Category_userId_name_type_key";
CREATE UNIQUE INDEX "Category_userId_nameVi_type_key" ON "Category"("userId", "nameVi", "type");

ALTER TABLE "Category" DROP COLUMN "name";

-- AlterTable Wallet
ALTER TABLE "Wallet" ADD COLUMN "nameVi" TEXT;
ALTER TABLE "Wallet" ADD COLUMN "nameEn" TEXT;

-- Backfill data for Wallet
UPDATE "Wallet" SET "nameVi" = "name" WHERE "nameVi" IS NULL;
UPDATE "Wallet" SET "nameEn" = 'Cash Wallet' WHERE "nameVi" = 'Ví tiền mặt';
UPDATE "Wallet" SET "nameEn" = 'Main Bank Account' WHERE "nameVi" = 'Vietcombank';
UPDATE "Wallet" SET "nameEn" = 'MoMo E-Wallet' WHERE "nameVi" = 'MoMo';

ALTER TABLE "Wallet" ALTER COLUMN "nameVi" SET NOT NULL;

DROP INDEX IF EXISTS "Wallet_userId_name_key";
CREATE UNIQUE INDEX "Wallet_userId_nameVi_key" ON "Wallet"("userId", "nameVi");

ALTER TABLE "Wallet" DROP COLUMN "name";
