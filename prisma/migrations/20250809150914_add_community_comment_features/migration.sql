-- AlterTable
ALTER TABLE "public"."UserBlogComment" ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "isEdited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "public"."CommentStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateTable
CREATE TABLE "public"."UserBlogCommentLike" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlogCommentLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserBlogCommentReport" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlogCommentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserBlogCommentLike_commentId_idx" ON "public"."UserBlogCommentLike"("commentId");

-- CreateIndex
CREATE INDEX "UserBlogCommentLike_userId_idx" ON "public"."UserBlogCommentLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlogCommentLike_commentId_userId_key" ON "public"."UserBlogCommentLike"("commentId", "userId");

-- CreateIndex
CREATE INDEX "UserBlogCommentReport_commentId_idx" ON "public"."UserBlogCommentReport"("commentId");

-- CreateIndex
CREATE INDEX "UserBlogCommentReport_userId_idx" ON "public"."UserBlogCommentReport"("userId");

-- CreateIndex
CREATE INDEX "UserBlogCommentReport_status_idx" ON "public"."UserBlogCommentReport"("status");

-- CreateIndex
CREATE INDEX "UserBlogComment_status_idx" ON "public"."UserBlogComment"("status");

-- AddForeignKey
ALTER TABLE "public"."UserBlogCommentLike" ADD CONSTRAINT "UserBlogCommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."UserBlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogCommentLike" ADD CONSTRAINT "UserBlogCommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogCommentReport" ADD CONSTRAINT "UserBlogCommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."UserBlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogCommentReport" ADD CONSTRAINT "UserBlogCommentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
