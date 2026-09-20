import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Faltan las variables de entorno de Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET"
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export const subirACloudinary = (
  fileBuffer: Buffer
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "catalogo-joyeria-alpez",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary no devolvió una URL segura"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Tipo mínimo que necesitamos de un archivo recibido por Multer
type ArchivoConBuffer = {
  buffer: Buffer;
};

export const subirMultiplesACloudinary = async (
  files: ArchivoConBuffer[]
): Promise<string[]> => {
  const promesas = files.map((file) =>
    subirACloudinary(file.buffer)
  );

  return Promise.all(promesas);
};

const obtenerPublicIdDesdeUrl = (url: string): string | null => {
  if (!url.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1) {
      return null;
    }

    const segments = parts.slice(uploadIndex + 2);
    if (segments.length === 0) {
      return null;
    }

    const publicIdWithExtension = segments.join('/');
    return publicIdWithExtension.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

export const eliminarDeCloudinary = async (url?: string | null): Promise<void> => {
  if (!url) {
    return;
  }

  const publicId = obtenerPublicIdDesdeUrl(url);
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId);
};

export const eliminarMultiplesDeCloudinary = async (urls: Array<string | null | undefined>): Promise<void> => {
  const urlsValidas = [...new Set(urls.filter((url): url is string => Boolean(url)))];

  await Promise.all(
    urlsValidas.map(async (url) => {
      try {
        await eliminarDeCloudinary(url);
      } catch (error) {
        console.error('Error al eliminar imagen de Cloudinary:', error);
      }
    })
  );
};