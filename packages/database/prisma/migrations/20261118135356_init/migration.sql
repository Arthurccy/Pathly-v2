-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('CONNECTED', 'SYNCING', 'DISCONNECTED', 'ACTION_NEEDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CHECKING', 'SAVINGS', 'LOAN', 'INVESTMENT', 'MEAL_VOUCHER', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('REAL_ESTATE', 'VEHICLE', 'WATCH', 'JEWELRY', 'ART', 'TECH', 'OTHER');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('MORTGAGE', 'AUTO', 'STUDENT', 'CONSUMER', 'REVOLVING');

-- CreateEnum
CREATE TYPE "InvestmentAccountType" AS ENUM ('PEA', 'CTO', 'CRYPTO', 'ASSURANCE_VIE', 'PER');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('REAL_ESTATE', 'TRAVEL', 'VEHICLE', 'BUSINESS', 'EMERGENCY_FUND', 'WEDDING', 'OTHER');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_connections" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "powensItemId" INTEGER,
    "institutionId" INTEGER,
    "institutionName" TEXT NOT NULL,
    "institutionLogo" TEXT,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "lastSuccessfulSync" TIMESTAMP(3),
    "lastSyncAttempt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "connectionId" UUID NOT NULL,
    "powensAccountId" INTEGER,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL DEFAULT 'CHECKING',
    "currentBalance" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "iban" TEXT,
    "institutionName" TEXT,
    "institutionLogo" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "powensTransactionId" INTEGER,
    "date" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawDescription" TEXT NOT NULL,
    "cleanedDescription" TEXT,
    "category" TEXT,
    "isPredicted" BOOLEAN NOT NULL DEFAULT false,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_assets" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AssetCategory" NOT NULL DEFAULT 'OTHER',
    "estimatedValue" DECIMAL(12,2) NOT NULL,
    "purchasePrice" DECIMAL(12,2),
    "purchaseDate" DATE,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physical_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans_credits" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "lenderInstitution" TEXT NOT NULL,
    "institutionLogo" TEXT,
    "loanType" "LoanType" NOT NULL DEFAULT 'CONSUMER',
    "initialAmount" DECIMAL(12,2) NOT NULL,
    "remainingCapital" DECIMAL(12,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "monthlyPayment" DECIMAL(10,2) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "insuranceMonthlyPayment" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_positions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "brokerInstitution" TEXT NOT NULL,
    "institutionLogo" TEXT,
    "accountType" "InvestmentAccountType" NOT NULL DEFAULT 'PEA',
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "unitBuyPrice" DECIMAL(12,4) NOT NULL,
    "currentPrice" DECIMAL(12,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "life_projects" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ProjectCategory" NOT NULL DEFAULT 'OTHER',
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "currentSaved" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "targetDate" DATE NOT NULL,
    "monthlyAllocation" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "life_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" UUID NOT NULL,
    "connectionId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "transactionsCount" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bank_connections_powensItemId_key" ON "bank_connections"("powensItemId");

-- CreateIndex
CREATE INDEX "bank_connections_userId_idx" ON "bank_connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_powensAccountId_key" ON "bank_accounts"("powensAccountId");

-- CreateIndex
CREATE INDEX "bank_accounts_connectionId_idx" ON "bank_accounts"("connectionId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_transactions_powensTransactionId_key" ON "bank_transactions"("powensTransactionId");

-- CreateIndex
CREATE INDEX "bank_transactions_accountId_date_idx" ON "bank_transactions"("accountId", "date");

-- CreateIndex
CREATE INDEX "bank_transactions_date_idx" ON "bank_transactions"("date");

-- CreateIndex
CREATE INDEX "physical_assets_userId_idx" ON "physical_assets"("userId");

-- CreateIndex
CREATE INDEX "loans_credits_userId_idx" ON "loans_credits"("userId");

-- CreateIndex
CREATE INDEX "investment_positions_userId_brokerInstitution_idx" ON "investment_positions"("userId", "brokerInstitution");

-- CreateIndex
CREATE INDEX "life_projects_userId_idx" ON "life_projects"("userId");

-- CreateIndex
CREATE INDEX "sync_logs_connectionId_createdAt_idx" ON "sync_logs"("connectionId", "createdAt");

-- AddForeignKey
ALTER TABLE "bank_connections" ADD CONSTRAINT "bank_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "bank_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_assets" ADD CONSTRAINT "physical_assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans_credits" ADD CONSTRAINT "loans_credits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_positions" ADD CONSTRAINT "investment_positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "life_projects" ADD CONSTRAINT "life_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "bank_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
