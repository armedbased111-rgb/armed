/*
  Warnings:

  - Made the column `slug` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "durationSec" INTEGER,
ADD COLUMN     "previewUrl" TEXT,
ADD COLUMN     "waveformData" JSONB,
ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

-- CreateTable
CREATE TABLE "ProductLicense" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "LicenseType" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',

    CONSTRAINT "ProductLicense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductLicense_productId_type_key" ON "ProductLicense"("productId", "type");

-- AddForeignKey
ALTER TABLE "ProductLicense" ADD CONSTRAINT "ProductLicense_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
