-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "workAddress" TEXT NOT NULL,
    "deliveryTerm" TEXT NOT NULL,
    "downPayment" DOUBLE PRECISION,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Pix ou dinheiro',
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quoteId" TEXT NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_quoteId_key" ON "Contract"("quoteId");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
