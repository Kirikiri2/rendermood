/*
  Warnings:

  - Added the required column `consent` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('question', 'form');

-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'slider';

-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "numberValue" INTEGER;

-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "defaultValue" INTEGER,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max" INTEGER,
ADD COLUMN     "min" INTEGER,
ADD COLUMN     "stepValue" INTEGER;

-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "StepType" NOT NULL DEFAULT 'question';

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "consent" BOOLEAN NOT NULL,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "pageUrl" TEXT,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "utmTerm" TEXT;

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");
