/*
  Warnings:

  - Made the column `country` on table `Donation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Donation" ALTER COLUMN "country" SET NOT NULL;
