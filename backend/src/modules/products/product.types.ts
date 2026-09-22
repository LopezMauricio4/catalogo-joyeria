export type ProductRecord = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  material: string;
  category: string;
  image: string | null;
  images: string[];
  features: string[];
  stock: number;
  featured: boolean;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface CrearProductoDTO {
  name?: string;
  description?: string;
  price?: number | string;
  material?: string;
  category?: string;
  stock?: number | string;
  featured?: boolean | string;
  features?: string | string[];
  image?: string;
}

export type ArchivoConBuffer = {
  buffer: Buffer;
  originalname?: string;
};

export type ProductoRespuesta = ProductRecord;
