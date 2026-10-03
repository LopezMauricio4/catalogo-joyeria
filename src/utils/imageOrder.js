export function moveImage(images, sourceId, targetId) {
  const from = images.findIndex(image => image.id === sourceId);
  const to = images.findIndex(image => image.id === targetId);
  if (from < 0 || to < 0 || from === to) return images;
  const next = [...images];
  const [image] = next.splice(from, 1);
  next.splice(to, 0, image);
  return next;
}

export function imageOrder(images) {
  let nextFile = 0;
  return images.map(image => image.file ? `new:${nextFile++}` : image.src);
}
