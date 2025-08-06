-- AlterTable
ALTER TABLE "public"."SiteSettings" ADD COLUMN     "adminEmails" TEXT[] DEFAULT ARRAY[]::TEXT[];
