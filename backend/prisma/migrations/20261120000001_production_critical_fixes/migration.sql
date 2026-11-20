-- AlterTable
ALTER TABLE "Order" 
    ADD COLUMN "trackingTokenHash" TEXT,
    ADD COLUMN "idempotencyKey" TEXT,
    ADD COLUMN "cancelledAt" TIMESTAMP(3),
    ADD COLUMN "cancelledBy" TEXT,
    ADD COLUMN "cancellationReason" TEXT,
    ALTER COLUMN "paymentMethod" SET DEFAULT 'COD',
    ALTER COLUMN "paymentStatus" SET DEFAULT 'UNPAID',
    ALTER COLUMN "orderStatus" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
CREATE INDEX "Order_trackingTokenHash_idx" ON "Order"("trackingTokenHash");
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
