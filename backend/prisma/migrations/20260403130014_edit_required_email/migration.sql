/*
  Warnings:

  - Made the column `email` on table `Submission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "email" SET NOT NULL;
