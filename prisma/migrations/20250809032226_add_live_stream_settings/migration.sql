-- AlterTable
ALTER TABLE "public"."SiteSettings" ADD COLUMN     "liveStreamActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "liveStreamUrl" TEXT;
