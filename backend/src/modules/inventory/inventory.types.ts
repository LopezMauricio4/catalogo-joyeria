import type { InventoryMovementType } from '@prisma/client';

export type ArchivoConBuffer = {
  buffer: Buffer;
};

export type InventoryItemRecord = {
  id: string;
  sku: string;
  name: string;
  category: string;
  material: string | null;
  size: string | null;
  description: string | null;
  image: string | null;
  images: string[];
  unit: string;
  stock: number;
  minStock: number;
  unitCost: number;
  salePrice: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InventoryItemDTO = {
  sku?: string;
  name?: string;
  category?: string;
  material?: string;
  size?: string;
  lengthCm?: number | string | null;
  thicknessMm?: number | string | null;
  weightGrams?: number | string | null;
  description?: string;
  unit?: string;
  stock?: number | string;
  minStock?: number | string;
  unitCost?: number | string;
  salePrice?: number | string;
  active?: boolean | string;
  image?: string;
};

export type InventoryMovementDTO = {
  type?: InventoryMovementType | string;
  quantity?: number | string;
  unitCost?: number | string;
  note?: string;
};
