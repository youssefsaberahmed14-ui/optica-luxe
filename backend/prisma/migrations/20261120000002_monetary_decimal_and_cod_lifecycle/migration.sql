-- Migration: 20261120000002_monetary_decimal_and_cod_lifecycle
-- Safely convert Float monetary columns to DECIMAL(10, 2) using explicit casts to avoid data loss.
-- Add paidAt and paidBy to Order for COD payment lifecycle tracking.

-- 1. Alter Product monetary fields
ALTER TABLE "Product"
    ALTER COLUMN "price" TYPE DECIMAL(10, 2) USING "price"::DECIMAL(10, 2),
    ALTER COLUMN "oldPrice" TYPE DECIMAL(10, 2) USING "oldPrice"::DECIMAL(10, 2);

-- 2. Alter Order monetary fields & add cash collection tracking
ALTER TABLE "Order"
    ALTER COLUMN "subtotal" TYPE DECIMAL(10, 2) USING "subtotal"::DECIMAL(10, 2),
    ALTER COLUMN "discount" TYPE DECIMAL(10, 2) USING "discount"::DECIMAL(10, 2),
    ALTER COLUMN "shipping" TYPE DECIMAL(10, 2) USING "shipping"::DECIMAL(10, 2),
    ALTER COLUMN "total" TYPE DECIMAL(10, 2) USING "total"::DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "paidBy" TEXT;

-- 3. Alter OrderItem monetary fields
ALTER TABLE "OrderItem"
    ALTER COLUMN "unitPrice" TYPE DECIMAL(10, 2) USING "unitPrice"::DECIMAL(10, 2),
    ALTER COLUMN "total" TYPE DECIMAL(10, 2) USING "total"::DECIMAL(10, 2);

-- 4. Alter Coupon monetary / discount fields
ALTER TABLE "Coupon"
    ALTER COLUMN "discountValue" TYPE DECIMAL(10, 2) USING "discountValue"::DECIMAL(10, 2);
