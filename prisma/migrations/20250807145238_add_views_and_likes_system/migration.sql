-- CreateTable
CREATE TABLE "public"."BlogPostView" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "viewDuration" INTEGER,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogPostLike" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogPostStats" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "registeredViews" INTEGER NOT NULL DEFAULT 0,
    "anonymousViews" INTEGER NOT NULL DEFAULT 0,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "avgViewDuration" DOUBLE PRECISION,
    "lastViewedAt" TIMESTAMP(3),
    "dailyViews" JSONB DEFAULT '{}',
    "hourlyViews" JSONB DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPostStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserEngagement" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "scrollDepth" DOUBLE PRECISION,
    "timeOnPage" INTEGER,
    "clicks" INTEGER DEFAULT 0,
    "shares" INTEGER DEFAULT 0,
    "comments" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RateLimit" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogPostView_blogPostId_idx" ON "public"."BlogPostView"("blogPostId");

-- CreateIndex
CREATE INDEX "BlogPostView_userId_idx" ON "public"."BlogPostView"("userId");

-- CreateIndex
CREATE INDEX "BlogPostView_sessionId_idx" ON "public"."BlogPostView"("sessionId");

-- CreateIndex
CREATE INDEX "BlogPostView_ipAddress_idx" ON "public"."BlogPostView"("ipAddress");

-- CreateIndex
CREATE INDEX "BlogPostView_createdAt_idx" ON "public"."BlogPostView"("createdAt");

-- CreateIndex
CREATE INDEX "BlogPostLike_blogPostId_idx" ON "public"."BlogPostLike"("blogPostId");

-- CreateIndex
CREATE INDEX "BlogPostLike_userId_idx" ON "public"."BlogPostLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostLike_blogPostId_userId_key" ON "public"."BlogPostLike"("blogPostId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostStats_blogPostId_key" ON "public"."BlogPostStats"("blogPostId");

-- CreateIndex
CREATE INDEX "UserEngagement_userId_idx" ON "public"."UserEngagement"("userId");

-- CreateIndex
CREATE INDEX "UserEngagement_sessionId_idx" ON "public"."UserEngagement"("sessionId");

-- CreateIndex
CREATE INDEX "UserEngagement_blogPostId_idx" ON "public"."UserEngagement"("blogPostId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEngagement_sessionId_blogPostId_key" ON "public"."UserEngagement"("sessionId", "blogPostId");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_action_windowStart_idx" ON "public"."RateLimit"("identifier", "action", "windowStart");

-- AddForeignKey
ALTER TABLE "public"."BlogPostView" ADD CONSTRAINT "BlogPostView_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPostView" ADD CONSTRAINT "BlogPostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPostLike" ADD CONSTRAINT "BlogPostLike_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPostLike" ADD CONSTRAINT "BlogPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPostStats" ADD CONSTRAINT "BlogPostStats_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserEngagement" ADD CONSTRAINT "UserEngagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserEngagement" ADD CONSTRAINT "UserEngagement_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
