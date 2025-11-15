-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SOUNDKIT', 'BEAT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LicenseType" ADD VALUE 'MP3';
ALTER TYPE "LicenseType" ADD VALUE 'WAV';
ALTER TYPE "LicenseType" ADD VALUE 'EXCLUSIVE';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "genre" TEXT,
ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'SOUNDKIT';
