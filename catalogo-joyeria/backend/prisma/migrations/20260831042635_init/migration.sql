-- CreateEnum
CREATE TYPE "Material" AS ENUM ('ORO_18K', 'ORO_LAMINADO');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('ANILLOS', 'CADENAS', 'PULSERAS', 'MANILLAS', 'TOPOS');

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "material" "Material" NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "imagenUrl" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 10,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);
