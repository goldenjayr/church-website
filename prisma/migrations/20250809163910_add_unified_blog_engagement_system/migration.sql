-- AlterTable
ALTER TABLE "public"."UserBlogPost" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "lastViewedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."UserBlogPostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlogPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserBlogPostLike_postId_idx" ON "public"."UserBlogPostLike"("postId");

-- CreateIndex
CREATE INDEX "UserBlogPostLike_userId_idx" ON "public"."UserBlogPostLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlogPostLike_postId_userId_key" ON "public"."UserBlogPostLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "UserBlogPost_lastViewedAt_idx" ON "public"."UserBlogPost"("lastViewedAt");

-- AddForeignKey
ALTER TABLE "public"."UserBlogPostLike" ADD CONSTRAINT "UserBlogPostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."UserBlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogPostLike" ADD CONSTRAINT "UserBlogPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
