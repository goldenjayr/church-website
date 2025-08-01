-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('HTML', 'MARKDOWN', 'PLAIN_TEXT');

-- AlterTable
ALTER TABLE "public"."BlogPost" ADD COLUMN     "contentType" "public"."ContentType" NOT NULL DEFAULT 'HTML',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "metaDescription" TEXT;

-- AlterTable
ALTER TABLE "public"."Doctrine" ADD COLUMN     "contentType" "public"."ContentType" NOT NULL DEFAULT 'HTML';
