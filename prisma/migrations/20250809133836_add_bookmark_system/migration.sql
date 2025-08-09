-- CreateTable
CREATE TABLE "public"."BlogBookmark" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserBlogBookmark" (
    "id" TEXT NOT NULL,
    "userBlogPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlogBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogBookmark_userId_idx" ON "public"."BlogBookmark"("userId");

-- CreateIndex
CREATE INDEX "BlogBookmark_blogPostId_idx" ON "public"."BlogBookmark"("blogPostId");

-- CreateIndex
CREATE INDEX "BlogBookmark_createdAt_idx" ON "public"."BlogBookmark"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogBookmark_blogPostId_userId_key" ON "public"."BlogBookmark"("blogPostId", "userId");

-- CreateIndex
CREATE INDEX "UserBlogBookmark_userId_idx" ON "public"."UserBlogBookmark"("userId");

-- CreateIndex
CREATE INDEX "UserBlogBookmark_userBlogPostId_idx" ON "public"."UserBlogBookmark"("userBlogPostId");

-- CreateIndex
CREATE INDEX "UserBlogBookmark_createdAt_idx" ON "public"."UserBlogBookmark"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlogBookmark_userBlogPostId_userId_key" ON "public"."UserBlogBookmark"("userBlogPostId", "userId");

-- AddForeignKey
ALTER TABLE "public"."BlogBookmark" ADD CONSTRAINT "BlogBookmark_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogBookmark" ADD CONSTRAINT "BlogBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogBookmark" ADD CONSTRAINT "UserBlogBookmark_userBlogPostId_fkey" FOREIGN KEY ("userBlogPostId") REFERENCES "public"."UserBlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlogBookmark" ADD CONSTRAINT "UserBlogBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
