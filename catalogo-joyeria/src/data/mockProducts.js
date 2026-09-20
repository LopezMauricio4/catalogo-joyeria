export const initialProducts = [
  {
    id: 'anillo-aurora',
    name: 'Anillo Aurora',
    material: 'oro-18k',
    category: 'anillos',
    price: 4200,
    image:
      'https://images.unsplash.com/photo-1601821765780-754fa98637c1?auto=format&fit=crop&w=900&q=80',
    description:
      'Anillo de oro 18k con diseño sobrio y elegante para uso diario, ideal para regalos especiales.',
    features: ['18 kilates', 'Acabado brillante', 'Diseño atemporal'],
  },
  {
    id: 'cadena-luna',
    name: 'Cadena Luna',
    material: 'oro-18k',
    category: 'cadenas',
    price: 3600,
    image:
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
    description:
      'Cadena elegante de oro 18k con acabado delicado y presencia visual sofisticada.',
    features: ['Longitud ajustable', 'Peso ligero', 'Look premium'],
  },
  {
    id: 'pulsera-sol',
    name: 'Pulsera Sol',
    material: 'oro-18k',
    category: 'pulseras',
    price: 3900,
    image:
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
    description:
      'Pulsera de oro 18k con un brillo cálido que combina refinamiento y versatilidad.',
    features: ['Diseño moderno', 'Terminación premium', 'Perfecta para combinar'],
  },
  {
    id: 'manilla-zen',
    name: 'Manilla Zen',
    material: 'oro-18k',
    category: 'manillas',
    price: 4700,
    image:
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
    description:
      'Manilla de oro 18k pensada para un estilo minimalista, con presencia y brillo impecables.',
    features: ['Estilo minimalista', 'Refuerzo de calidad', 'Brillo intenso'],
  },
  {
    id: 'topo-estrella',
    name: 'Topo Estrella',
    material: 'oro-18k',
    category: 'topos',
    price: 3100,
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
    description:
      'Topo delicado para quienes buscan una pieza fina, elegante y con identidad elegante.',
    features: ['Diseño ligero', 'Ajuste cómodo', 'Elegancia discreta'],
  },
  {
    id: 'anillo-glamour',
    name: 'Anillo Glamour',
    material: 'laminado',
    category: 'anillos',
    price: 1850,
    image:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
    description:
      'Anillo en oro laminado 18k con apariencia dorada, ideal para uso diario y estilo versátil.',
    features: ['18k laminado', 'Asequible', 'Fácil de combinar'],
  },
  {
    id: 'cadena-besos',
    name: 'Cadena Besos',
    material: 'laminado',
    category: 'cadenas',
    price: 2100,
    image:
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
    description:
      'Cadena con tono dorado cálido y diseño ligero para llevarla todos los días con estilo.',
    features: ['Acabado dorado', 'Ligera', 'Ideal para layering'],
  },
  {
    id: 'pulsera-aurora',
    name: 'Pulsera Aurora',
    material: 'laminado',
    category: 'pulseras',
    price: 2400,
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    description:
      'Pulsera en oro laminado 18k que aporta brillo y estilo elegante sin sobrecargar el look.',
    features: ['Color dorado intenso', 'Uso cotidiano', 'Muy favorecedora'],
  },
  {
    id: 'manilla-orion',
    name: 'Manilla Orion',
    material: 'laminado',
    category: 'manillas',
    price: 2650,
    image:
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
    description:
      'Manilla de oro laminado 18k con diseño sobrio para quienes buscan un accesorio elegante.',
    features: ['Finura premium', 'Apariencia sofisticada', 'Estilo contemporáneo'],
  },
  {
    id: 'topo-royal',
    name: 'Topo Royal',
    material: 'laminado',
    category: 'topos',
    price: 1950,
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
    description:
      'Topo de oro laminado 18k con un acabado brillante ideal para combinar con otras piezas.',
    features: ['Ligeramente elegante', 'Brillo duradero', 'Versátil'],
  },
];

export const products = [...initialProducts];

export const categories = [
  { key: 'anillos', label: 'Anillos' },
  { key: 'cadenas', label: 'Cadenas' },
  { key: 'pulseras', label: 'Pulseras' },
  { key: 'manillas', label: 'Manillas' },
  { key: 'topos', label: 'Topos' },
];

export const materialLabels = {
  'oro-18k': 'Oro 18k',
  laminado: 'Oro laminado 18k',
};
