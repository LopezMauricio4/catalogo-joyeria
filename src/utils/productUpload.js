// Reserve space for the multipart headers and the product fields.
export const MAX_IMAGE_BYTES = 4_000_000;

async function optimizeImage(file, budget) {
  if (file.size <= budget) return file;
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error(`No se pudo leer la imagen ${file.name}. Prueba con otra foto.`));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudieron optimizar las fotos. Prueba con imágenes más pequeñas.');
    for (const [dimension, quality] of [[1800, 0.85], [1500, 0.75], [1200, 0.65], [900, 0.6]]) {
      const scale = Math.min(1, dimension / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= budget) {
        const extension = blob.type === 'image/webp' ? 'webp' : 'png';
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${extension}`, { type: blob.type, lastModified: file.lastModified });
      }
    }
    throw new Error(`La foto ${file.name} es demasiado pesada. Elige una versión más pequeña.`);
  } finally { URL.revokeObjectURL(url); }
}

export async function prepareProductImages(files) {
  if (files.reduce((total, file) => total + file.size, 0) <= MAX_IMAGE_BYTES) return files;
  const budget = Math.floor(MAX_IMAGE_BYTES / files.length);
  // Process sequentially to avoid decoding several large photos at once on mobile.
  const result = [];
  for (const file of files) result.push(await optimizeImage(file, budget));
  return result;
}

export async function readProductSaveResponse(response, fallback) {
  const body = await response.text();
  if (response.status === 413) throw new Error('Las imágenes superan el tamaño permitido. Prueba con fotos más pequeñas.');
  let data;
  try { data = JSON.parse(body); }
  catch { throw new Error(response.ok ? 'El servidor devolvió una respuesta inesperada. Actualiza la lista antes de volver a guardar.' : `${fallback} El servidor no pudo procesar la solicitud (código ${response.status}).`); }
  if (!response.ok) throw new Error(data?.message || fallback);
  if (!data?.product?.id) throw new Error('No se pudo confirmar el guardado. Actualiza la lista antes de volver a guardar.');
  return data;
}
