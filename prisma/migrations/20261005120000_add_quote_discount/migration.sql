-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('VALOR', 'PERCENTUAL');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'VALOR';
