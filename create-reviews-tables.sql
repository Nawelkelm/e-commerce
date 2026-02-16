-- Create Reviews table
CREATE TABLE IF NOT EXISTS "Reviews" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES "Products"(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "orderId" UUID REFERENCES "Orders"(id) ON DELETE SET NULL,
  "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "title" VARCHAR(200),
  "comment" TEXT,
  "images" TEXT[],
  "isVerifiedPurchase" BOOLEAN DEFAULT FALSE,
  "isApproved" BOOLEAN DEFAULT FALSE,
  "helpfulCount" INTEGER DEFAULT 0,
  "notHelpfulCount" INTEGER DEFAULT 0,
  "adminResponse" TEXT,
  "adminRespondedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "productId")
);

-- Create indexes for Reviews
CREATE INDEX IF NOT EXISTS "reviews_product_id" ON "Reviews"("productId");
CREATE INDEX IF NOT EXISTS "reviews_user_id" ON "Reviews"("userId");
CREATE INDEX IF NOT EXISTS "reviews_order_id" ON "Reviews"("orderId");
CREATE INDEX IF NOT EXISTS "reviews_rating" ON "Reviews"("rating");
CREATE INDEX IF NOT EXISTS "reviews_is_approved" ON "Reviews"("isApproved");
CREATE INDEX IF NOT EXISTS "reviews_is_verified_purchase" ON "Reviews"("isVerifiedPurchase");
CREATE INDEX IF NOT EXISTS "reviews_created_at" ON "Reviews"("createdAt");

-- Create ReviewHelpful table
CREATE TABLE IF NOT EXISTS "ReviewHelpful" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "reviewId" UUID NOT NULL REFERENCES "Reviews"(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "isHelpful" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "reviewId")
);

-- Create indexes for ReviewHelpful
CREATE INDEX IF NOT EXISTS "review_helpful_review_id" ON "ReviewHelpful"("reviewId");
CREATE INDEX IF NOT EXISTS "review_helpful_user_id" ON "ReviewHelpful"("userId");

-- Add review fields to Products table
ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "averageRating" DECIMAL(3,2) DEFAULT 0;
ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "totalReviews" INTEGER DEFAULT 0;
