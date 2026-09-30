-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "stock" SET DATA TYPE DECIMAL(18,6),
ALTER COLUMN "minStock" SET DATA TYPE DECIMAL(18,6),
ALTER COLUMN "unitCost" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "salePrice" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "InventoryMovement" ADD COLUMN     "saleId" TEXT,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(18,6),
ALTER COLUMN "previousStock" SET DATA TYPE DECIMAL(18,6),
ALTER COLUMN "resultingStock" SET DATA TYPE DECIMAL(18,6),
ALTER COLUMN "unitCost" SET DATA TYPE DECIMAL(18,2);

-- CreateTable
CREATE TABLE "ProductComponent" (
    "productId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,

    CONSTRAINT "ProductComponent_pkey" PRIMARY KEY ("productId","itemId")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "total" DECIMAL(18,2) NOT NULL,
    "totalCost" DECIMAL(18,2) NOT NULL,
    "note" TEXT,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleLine" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT,
    "itemId" TEXT,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "unitPrice" DECIMAL(18,2) NOT NULL,
    "unitCost" DECIMAL(18,6) NOT NULL,
    "total" DECIMAL(18,2) NOT NULL,
    "totalCost" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "SaleLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductComponent_itemId_idx" ON "ProductComponent"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_requestKey_key" ON "Sale"("requestKey");

-- CreateIndex
CREATE INDEX "Sale_occurredAt_idx" ON "Sale"("occurredAt");

-- CreateIndex
CREATE INDEX "SaleLine_saleId_idx" ON "SaleLine"("saleId");

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductComponent" ADD CONSTRAINT "ProductComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductComponent" ADD CONSTRAINT "ProductComponent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleLine" ADD CONSTRAINT "SaleLine_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleLine" ADD CONSTRAINT "SaleLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleLine" ADD CONSTRAINT "SaleLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public."ProductComponent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Sale" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SaleLine" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ProductComponent", public."Sale", public."SaleLine" FROM anon, authenticated;
ALTER TABLE public."InventoryItem" ADD CONSTRAINT "inventory_stock_nonnegative" CHECK (stock >= 0);
ALTER TABLE public."ProductComponent" ADD CONSTRAINT "component_quantity_positive" CHECK (quantity > 0);
ALTER TABLE public."SaleLine" ADD CONSTRAINT "sale_line_valid_amounts" CHECK (quantity > 0 AND "unitPrice" >= 0 AND total >= 0 AND "totalCost" >= 0);
