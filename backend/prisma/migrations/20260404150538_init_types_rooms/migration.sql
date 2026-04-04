/*
  Warnings:

  - You are about to drop the column `parentId` on the `Option` table. All the data in the column will be lost.
  - You are about to drop the column `optionId` on the `SliderConfig` table. All the data in the column will be lost.
  - You are about to drop the `OptionDependency` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[questionId,propertyType]` on the table `SliderConfig` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `propertyType` to the `SliderConfig` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('residential', 'commercial');

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_parentId_fkey";

-- DropForeignKey
ALTER TABLE "OptionDependency" DROP CONSTRAINT "OptionDependency_childOptionId_fkey";

-- DropForeignKey
ALTER TABLE "OptionDependency" DROP CONSTRAINT "OptionDependency_parentOptionId_fkey";

-- DropForeignKey
ALTER TABLE "SliderConfig" DROP CONSTRAINT "SliderConfig_optionId_fkey";

-- DropIndex
DROP INDEX "SliderConfig_questionId_optionId_key";

-- AlterTable
ALTER TABLE "Option" DROP COLUMN "parentId",
ADD COLUMN     "propertyType" "PropertyType";

-- AlterTable
ALTER TABLE "SliderConfig" DROP COLUMN "optionId",
ADD COLUMN     "propertyType" "PropertyType" NOT NULL;

-- DropTable
DROP TABLE "OptionDependency";

-- CreateIndex
CREATE UNIQUE INDEX "SliderConfig_questionId_propertyType_key" ON "SliderConfig"("questionId", "propertyType");
