-- CreateEnum
CREATE TYPE "public"."CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- CreateTable
CREATE TABLE "public"."BlogComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "status" "public"."CommentStatus" NOT NULL DEFAULT 'APPROVED',
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentLike" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentReport" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogComment_blogPostId_idx" ON "public"."BlogComment"("blogPostId");

-- CreateIndex
CREATE INDEX "BlogComment_userId_idx" ON "public"."BlogComment"("userId");

-- CreateIndex
CREATE INDEX "BlogComment_parentId_idx" ON "public"."BlogComment"("parentId");

-- CreateIndex
CREATE INDEX "BlogComment_status_idx" ON "public"."BlogComment"("status");

-- CreateIndex
CREATE INDEX "BlogComment_createdAt_idx" ON "public"."BlogComment"("createdAt");

-- CreateIndex
CREATE INDEX "CommentLike_commentId_idx" ON "public"."CommentLike"("commentId");

-- CreateIndex
CREATE INDEX "CommentLike_userId_idx" ON "public"."CommentLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentLike_commentId_userId_key" ON "public"."CommentLike"("commentId", "userId");

-- CreateIndex
CREATE INDEX "CommentReport_commentId_idx" ON "public"."CommentReport"("commentId");

-- CreateIndex
CREATE INDEX "CommentReport_userId_idx" ON "public"."CommentReport"("userId");

-- CreateIndex
CREATE INDEX "CommentReport_status_idx" ON "public"."CommentReport"("status");

-- AddForeignKey
ALTER TABLE "public"."BlogComment" ADD CONSTRAINT "BlogComment_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogComment" ADD CONSTRAINT "BlogComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogComment" ADD CONSTRAINT "BlogComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."BlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."BlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentLike" ADD CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReport" ADD CONSTRAINT "CommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."BlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReport" ADD CONSTRAINT "CommentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
