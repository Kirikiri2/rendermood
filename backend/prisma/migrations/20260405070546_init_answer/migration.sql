/*
  Warnings:

  - You are about to drop the column `numberValue` on the `Answer` table. All the data in the column will be lost.
  - Added the required column `value` to the `Answer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Answer_questionId_idx";

-- DropIndex
DROP INDEX "Answer_submissionId_idx";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "numberValue",
DROP COLUMN "value",
ADD COLUMN     "value" JSONB NOT NULL;
