/*
  Warnings:

  - You are about to drop the column `quizId` on the `Step` table. All the data in the column will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stepId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `Step` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Step" DROP CONSTRAINT "Step_quizId_fkey";

-- DropIndex
DROP INDEX "Step_quizId_order_key";

-- AlterTable
ALTER TABLE "Step" DROP COLUMN "quizId";

-- DropTable
DROP TABLE "Quiz";

-- CreateIndex
CREATE UNIQUE INDEX "Question_stepId_key" ON "Question"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "Step_order_key" ON "Step"("order");
