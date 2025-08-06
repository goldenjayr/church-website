/*
  Warnings:

  - You are about to drop the column `titktokUrl` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SiteSettings" DROP COLUMN "titktokUrl",
ADD COLUMN     "tiktokUrl" TEXT;
