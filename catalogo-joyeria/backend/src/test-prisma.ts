import { prisma } from './lib/prisma.js';

async function main() {
  const productos = await prisma.product.findMany();

  console.log("✅ Conexión exitosa con Supabase");
  console.log("Productos encontrados:", productos);
}

main()
  .catch((error) => {
    console.error("❌ Error de conexión:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });