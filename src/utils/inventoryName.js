const quantity = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 6 });

export function inventoryName(item) {
  const size = String(item.size ?? '').trim();
  const sizeUnits = { gramo: 'g', metro: 'm', milimetro: 'mm' };
  const sizeLabel = size && /^#?\s*\d+(?:[.,]\d+)?$/.test(size)
    ? `${size.replace(/^#\s*/, '')} ${item.category === 'balines' ? 'mm' : sizeUnits[item.unit] || ''}`.trim()
    : size;
  const measurements = [sizeLabel,
    Number(item.lengthCm) > 0 && `${quantity.format(Number(item.lengthCm))} cm de longitud`,
    Number(item.thicknessMm) > 0 && `${quantity.format(Number(item.thicknessMm))} mm de grosor`,
  ].filter(Boolean).join(' y ');
  return `${item.name}${measurements ? ` de ${measurements}` : ''}`;
}
