-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "numberValue" INTEGER,
ALTER COLUMN "value" DROP NOT NULL,
ALTER COLUMN "value" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "Answer_submissionId_idx" ON "Answer"("submissionId");

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");
