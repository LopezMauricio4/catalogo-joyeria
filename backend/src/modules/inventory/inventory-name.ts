const number = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 6 });
type Item = { name: string; category: string; size?: string | null; lengthCm?: unknown; thicknessMm?: unknown };

export function inventorySaleName(item: Item) {
  let size = String(item.size ?? '').trim();
  if (item.category === 'balines' && /^#?\s*\d+(?:[.,]\d+)?$/.test(size)) size = `${size.replace(/^#\s*/, '')} mm`;
  const measurements = [size,
    Number(item.lengthCm) > 0 && `${number.format(Number(item.lengthCm))} cm de longitud`,
    Number(item.thicknessMm) > 0 && `${number.format(Number(item.thicknessMm))} mm de grosor`,
  ].filter(Boolean).join(' y ');
  return `${item.name}${measurements ? ` de ${measurements}` : ''}`;
}

export function presentSaleLine<T extends { name: string; unit: string; item?: Item | null }>(line: T) {
  const { item, ...details } = line;
  return { ...details,
    name: item && line.name === item.name ? inventorySaleName(item) : line.name,
    unit: item?.category === 'balines' ? 'unidad' : line.unit,
  };
}
