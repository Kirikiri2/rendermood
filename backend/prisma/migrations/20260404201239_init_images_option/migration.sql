/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "imageUrl";
