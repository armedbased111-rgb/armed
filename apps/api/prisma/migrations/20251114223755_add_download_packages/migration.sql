-- CreateTable
CREATE TABLE "DownloadPackage" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "zipUrl" TEXT,
    "zipHash" TEXT NOT NULL,
    "licenseUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "fileSizeMb" DOUBLE PRECISION,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "maxDownloads" INTEGER NOT NULL DEFAULT 3,
    "lastDownloadAt" TIMESTAMP(3),

    CONSTRAINT "DownloadPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DownloadPackage_orderId_key" ON "DownloadPackage"("orderId");

-- CreateIndex
CREATE INDEX "DownloadPackage_orderId_idx" ON "DownloadPackage"("orderId");

-- CreateIndex
CREATE INDEX "DownloadPackage_zipHash_idx" ON "DownloadPackage"("zipHash");

-- AddForeignKey
ALTER TABLE "DownloadPackage" ADD CONSTRAINT "DownloadPackage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
