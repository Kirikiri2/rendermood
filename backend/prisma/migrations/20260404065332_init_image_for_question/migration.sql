/*
  Warnings:

  - You are about to drop the column `alt` on the `QuestionImage` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `QuestionImage` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `QuestionImage` table. All the data in the column will be lost.
  - Added the required column `key` to the `QuestionImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "QuestionImage_questionId_idx";

-- AlterTable
ALTER TABLE "QuestionImage" DROP COLUMN "alt",
DROP COLUMN "createdAt",
DROP COLUMN "sortOrder",
ADD COLUMN     "key" TEXT NOT NULL;
