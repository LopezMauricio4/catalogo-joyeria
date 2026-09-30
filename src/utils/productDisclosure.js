export function readProductDisclosure(features = []) {
  const get = prefix => features.find(value => value.startsWith(prefix))?.slice(prefix.length).trim() || '';
  return { measurements: get('Medidas: '), composition: get('Composición: '),
    features: features.filter(value => !value.startsWith('Medidas: ') && !value.startsWith('Composición: ')).join(', ') };
}

export function disclosureFeatures(form) {
  return [`Composición: ${form.composition.trim()}`, `Medidas: ${form.measurements.trim()}`,
    ...String(form.features || '').split(',').map(value => value.trim()).filter(Boolean)];
}
