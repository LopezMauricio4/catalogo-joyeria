export function readProductDisclosure(features = []) {
  const get = prefix => features.find(value => value.startsWith(prefix))?.slice(prefix.length).trim() || '';
  return { measurements: get('Medidas: '), composition: get('Composición: '),
    features: features.filter(value => !value.startsWith('Medidas: ') && !value.startsWith('Composición: ')).join(', ') };
}

export function disclosureFeatures(form) {
  const composition = String(form.composition || '').trim();
  const measurements = String(form.measurements || '').trim();
  return [...(composition ? [`Composición: ${composition}`] : []), ...(measurements ? [`Medidas: ${measurements}`] : []),
    ...String(form.features || '').split(',').map(value => value.trim()).filter(Boolean)];
}
