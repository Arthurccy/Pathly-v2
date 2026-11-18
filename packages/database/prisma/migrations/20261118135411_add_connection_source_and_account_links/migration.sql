-- CreateEnum
CREATE TYPE "ConnectionSource" AS ENUM ('POWENS', 'MANUAL', 'FILE_IMPORT');

-- DropIndex
DROP INDEX "bank_connections_userId_idx";

-- AlterTable
ALTER TABLE "bank_accounts" ALTER COLUMN "currentBalance" DROP NOT NULL;

-- AlterTable
ALTER TABLE "bank_connections" ADD COLUMN     "source" "ConnectionSource" NOT NULL DEFAULT 'POWENS';

-- AlterTable
ALTER TABLE "investment_positions" ADD COLUMN     "accountId" UUID;

-- AlterTable
ALTER TABLE "loans_credits" ADD COLUMN     "accountId" UUID;

-- CreateIndex
CREATE INDEX "bank_connections_userId_source_idx" ON "bank_connections"("userId", "source");

-- CreateIndex
CREATE INDEX "investment_positions_accountId_idx" ON "investment_positions"("accountId");

-- CreateIndex
CREATE INDEX "loans_credits_accountId_idx" ON "loans_credits"("accountId");

-- AddForeignKey
ALTER TABLE "loans_credits" ADD CONSTRAINT "loans_credits_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_positions" ADD CONSTRAINT "investment_positions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
