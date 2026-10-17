import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readTikTokPlayerState } from '../src/utils/tiktok.js';

const player = {};
const event = (type, value) => ({ origin: 'https://www.tiktok.com', source: player, data: { 'x-tiktok-player': true, type, value } });

test('la vista previa solo se revela cuando su reproductor confirma estar listo', () => {
  assert.equal(readTikTokPlayerState(event('onPlayerReady'), player), 'ready');
  assert.equal(readTikTokPlayerState(event('onStateChange', 3), player), null);
  assert.equal(readTikTokPlayerState({ ...event('onPlayerReady'), source: {} }, player), null);
  assert.equal(readTikTokPlayerState({ ...event('onPlayerReady'), origin: 'https://example.com' }, player), null);
  assert.equal(readTikTokPlayerState({ ...event('onPlayerReady'), data: { type: 'onPlayerReady' } }, player), null);
});

test('errores de servidor y reproducción activan la alternativa; el bloqueo de autoplay no oculta el video', () => {
  for (const errorCode of [1001, 2001, 3001]) {
    assert.equal(readTikTokPlayerState(event('onPlayerError', { errorCode }), player), 'unavailable');
  }
  assert.equal(readTikTokPlayerState(event('onPlayerError', { errorCode: 3002 }), player), null);
  assert.equal(readTikTokPlayerState(event('onError', 2), player), 'unavailable');
  assert.equal(readTikTokPlayerState({ ...event('onPlayerReady'), data: null }, player), null);
});
