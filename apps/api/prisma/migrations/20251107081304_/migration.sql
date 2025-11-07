/*
  Warnings:

  - You are about to drop the column `number` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPriceCents` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `buyerEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseType` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceCents` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('STANDARD', 'EXTENDED');

-- DropIndex
DROP INDEX "Order_number_key";

-- DropIndex
DROP INDEX "Product_sku_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "number",
ADD COLUMN     "buyerEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "quantity",
DROP COLUMN "unitPriceCents",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "licenseType" "LicenseType" NOT NULL,
ADD COLUMN     "priceCents" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "name",
DROP COLUMN "sku",
DROP COLUMN "stock",
ADD COLUMN     "bpm" INTEGER,
ADD COLUMN     "key" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
