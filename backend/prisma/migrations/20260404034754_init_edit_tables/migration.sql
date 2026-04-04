/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `pageUrl` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `utmCampaign` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `utmContent` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `utmMedium` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `utmSource` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `utmTerm` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "ipAddress",
DROP COLUMN "pageUrl",
DROP COLUMN "userAgent",
DROP COLUMN "utmCampaign",
DROP COLUMN "utmContent",
DROP COLUMN "utmMedium",
DROP COLUMN "utmSource",
DROP COLUMN "utmTerm";
