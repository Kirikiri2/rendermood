/*
  Warnings:

  - You are about to drop the column `propertyType` on the `SliderConfig` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[questionId,optionId]` on the table `SliderConfig` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `optionId` to the `SliderConfig` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SliderConfig_questionId_propertyType_key";

-- AlterTable
ALTER TABLE "SliderConfig" DROP COLUMN "propertyType",
ADD COLUMN     "optionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SliderConfig_questionId_optionId_key" ON "SliderConfig"("questionId", "optionId");

-- AddForeignKey
ALTER TABLE "SliderConfig" ADD CONSTRAINT "SliderConfig_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
