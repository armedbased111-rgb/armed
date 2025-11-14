-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "fileSizeMb" DOUBLE PRECISION,
ADD COLUMN     "fileUrl" TEXT;

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxDownloads" INTEGER NOT NULL DEFAULT 3,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "ipAddresses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "downloadDates" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Download_token_key" ON "Download"("token");

-- CreateIndex
CREATE INDEX "Download_token_idx" ON "Download"("token");

-- CreateIndex
CREATE INDEX "Download_orderId_idx" ON "Download"("orderId");

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
