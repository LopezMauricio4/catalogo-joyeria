ALTER TABLE "InventoryItem"
  ADD COLUMN "lengthCm" DECIMAL(12,3),
  ADD COLUMN "thicknessMm" DECIMAL(12,3),
  ADD COLUMN "weightGrams" DECIMAL(12,3),
  ADD CONSTRAINT "InventoryItem_length_positive" CHECK ("lengthCm" IS NULL OR "lengthCm" > 0),
  ADD CONSTRAINT "InventoryItem_thickness_positive" CHECK ("thicknessMm" IS NULL OR "thicknessMm" > 0),
  ADD CONSTRAINT "InventoryItem_weight_positive" CHECK ("weightGrams" IS NULL OR "weightGrams" > 0);
