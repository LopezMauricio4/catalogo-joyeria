import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { categories, materialLabels } from '../data/mockProducts';

export default function MobileCatalogMenu({ onNavigate }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedMaterial = params.get('material') || 'oro-18k';
  const selectedCategory = params.get('categoria') || '';
  const isCatalog = location.pathname === '/catalogo';
  return <details className="mobile-catalog-menu">
    <summary>Catálogo<ChevronDown size={15} aria-hidden="true" /></summary>
    <div className="mobile-catalog-materials">
      {Object.entries(materialLabels).map(([material, label]) => <details key={material} className="mobile-catalog-material" data-material={material}>
        <summary>{label}<ChevronDown size={14} aria-hidden="true" /></summary>
        <div className="mobile-catalog-collections">
          {[{ key: '', label: 'Todas las piezas' }, ...categories].map(category => <Link key={category.key || 'all'}
            to={`/catalogo?${new URLSearchParams({ material, ...(category.key ? { categoria: category.key } : {}) })}`}
            aria-current={isCatalog && selectedMaterial === material && selectedCategory === category.key ? 'page' : undefined}
            onClick={onNavigate}>{category.label}</Link>)}
        </div>
      </details>)}
    </div>
  </details>;
}
