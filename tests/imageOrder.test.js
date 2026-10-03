import assert from 'node:assert/strict';
import { test } from 'node:test';
import { imageOrder, moveImage } from '../src/utils/imageOrder.js';

test('ordena imágenes existentes y nuevas conservando sus referencias al subir', () => {
  const gallery = [{ id: 'a', src: 'https://example.com/a.jpg' }, { id: 'b', file: new File(['b'], 'b.jpg') }, { id: 'c', src: 'https://example.com/c.jpg' }];
  const reordered = moveImage(gallery, 'b', 'a');
  assert.deepEqual(reordered.map(image => image.id), ['b', 'a', 'c']);
  assert.deepEqual(imageOrder(reordered), ['new:0', 'https://example.com/a.jpg', 'https://example.com/c.jpg']);
  assert.deepEqual(moveImage(reordered, 'b', 'c').map(image => image.id), ['a', 'c', 'b']);
  assert.equal(moveImage(gallery, 'missing', 'a'), gallery);
  assert.deepEqual(gallery.map(image => image.id), ['a', 'b', 'c']);
});
