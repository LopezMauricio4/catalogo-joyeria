import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareProductImages, readProductSaveResponse } from '../src/utils/productUpload.js';

test('conserva las fotos originales cuando juntas caben en la solicitud', async () => {
  const files = [new File(['foto1'], 'a.jpg'), new File(['foto2'], 'b.jpg')];
  assert.equal(await prepareProductImages(files), files);
});
test('un rechazo por tamaño sin JSON muestra un mensaje útil', async () => {
  await assert.rejects(readProductSaveResponse(new Response('FUNCTION_PAYLOAD_TOO_LARGE', { status: 413 }), 'Error'), /imágenes superan/);
});
test('respuestas HTML y errores JSON no producen el error de patrón del navegador', async () => {
  await assert.rejects(readProductSaveResponse(new Response('<html>Error</html>', { status: 502 }), 'No se pudo crear.'), /502/);
  await assert.rejects(readProductSaveResponse(new Response(JSON.stringify({ message: 'Error de imágenes' }), { status: 400 }), 'Error'), /Error de imágenes/);
  assert.deepEqual(await readProductSaveResponse(new Response(JSON.stringify({ product: { id: 'a', images: ['1', '2'] } })), 'Error'), { product: { id: 'a', images: ['1', '2'] } });
});
