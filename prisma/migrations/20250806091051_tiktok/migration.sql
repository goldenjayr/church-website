/*
  Warnings:

  - You are about to drop the column `tiktokUrl` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SiteSettings" DROP COLUMN "tiktokUrl",
ADD COLUMN     "titktokUrl" TEXT;
