export const tikTokProfileUrl = 'https://www.tiktok.com/@alpez.joyeria';

// Public videos verified in Alpez's official creator embed. This is a curated
// selection, not an automatically synchronized feed; keep IDs as strings.
export const tikTokVideos = [
  { id: '7697682913428589845', label: 'Video 1' },
  { id: '7695473734601149717', label: 'Video 2' },
  { id: '7692930758239096084', label: 'Video 3' },
];

export function readTikTokPlayerState(event, playerWindow) {
  if (!playerWindow || event.origin !== 'https://www.tiktok.com' || event.source !== playerWindow) return null;
  const data = event.data;
  if (!data || typeof data !== 'object' || data['x-tiktok-player'] !== true) return null;
  if (data.type === 'onPlayerReady') return 'ready';
  if (data.type === 'onError') return 'unavailable';
  if (data.type === 'onPlayerError' && data.value?.errorCode !== 3002) return 'unavailable';
  return null;
}
