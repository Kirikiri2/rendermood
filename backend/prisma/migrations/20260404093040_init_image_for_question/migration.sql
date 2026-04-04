/*
  Warnings:

  - Added the required column `consent` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('question', 'form');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'slider';
ALTER TYPE "QuestionType" ADD VALUE 'carousel';

-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "numberValue" INTEGER;

-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "defaultValue" INTEGER,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max" INTEGER,
ADD COLUMN     "min" INTEGER,
ADD COLUMN     "stepValue" INTEGER;

-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "StepType" NOT NULL DEFAULT 'question';

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "consent" BOOLEAN NOT NULL;

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");
