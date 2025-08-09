-- CreateTable
CREATE TABLE "public"."UserBlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "authorId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "UserBlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserBlogLike" (
    "id" TEXT NOT NULL,
    "userBlogPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlogLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserBlogComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userBlogPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBlogPost_slug_key" ON "public"."UserBlogPost"("slug");

-- CreateIndex
CREATE INDEX "UserBlogPost_authorId_idx" ON "public"."UserBlogPost"("authorId");

-- CreateIndex
CREATE INDEX "UserBlogPost_published_idx" ON "public"."UserBlogPost"("published");

-- CreateIndex
CREATE INDEX "UserBlogPost_slug_idx" ON "public"."UserBlogPost"("slug");

-- CreateIndex
CREATE INDEX "UserBlogPost_createdAt_idx" ON "public"."UserBlogPost"("createdAt");

-- CreateIndex
CREATE INDEX "UserBlogLike_userBlogPostId_idx" ON "public"."UserBlogLike"("userBlogPostId");

-- CreateIndex
CREATE INDEX "UserBlogLike_userId_idx" ON "public"."UserBlogLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlogLike_userBlogPostId_userId_key" ON "public"."UserBlogLike"("userBlogPostId", "userId");

-- CreateIndex
CREATE INDEX "UserBlogComment_userBlogPostId_idx" ON "public"."UserBlogComment"("userBlogPostId");

-- CreateIndex
CREATE INDEX "UserBlogComment_userId_idx" ON "public"."UserBlogComment"("userId");

-- CreateIndex
CREATE INDEX "UserBlogComment_parentId_idx" ON "public"."UserBlogComment"("parentId");

-- CreateIndex
CREATE INDEX "UserBlogComment_createdAt_idx" ON "public"."UserBlogComment"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."UserBlogPost" ADD CONSTRAINT "UserBlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogLike" ADD CONSTRAINT "UserBlogLike_userBlogPostId_fkey" FOREIGN KEY ("userBlogPostId") REFERENCES "public"."UserBlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogLike" ADD CONSTRAINT "UserBlogLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogComment" ADD CONSTRAINT "UserBlogComment_userBlogPostId_fkey" FOREIGN KEY ("userBlogPostId") REFERENCES "public"."UserBlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogComment" ADD CONSTRAINT "UserBlogComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogComment" ADD CONSTRAINT "UserBlogComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."UserBlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
