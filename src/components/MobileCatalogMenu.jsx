import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { categories, materialLabels } from '../data/mockProducts';

function MenuBranch({ label, to, onNavigate, className, material, children }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return <div className={className} data-material={material}>
    <div className="mobile-catalog-row">
      <Link to={to} onClick={onNavigate}>{label}</Link>
      <button type="button" aria-label={`${open ? 'Ocultar' : 'Desplegar'} opciones de ${label}`} aria-expanded={open} aria-controls={contentId} onClick={() => setOpen(current => !current)}>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
    </div>
    <div id={contentId} hidden={!open}>{children}</div>
  </div>;
}

export default function MobileCatalogMenu({ onNavigate }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedMaterial = params.get('material') || '';
  const selectedCategory = params.get('categoria') || '';
  const isCatalog = location.pathname === '/catalogo';
  return <MenuBranch className="mobile-catalog-menu" label="Catálogo" to="/catalogo" onNavigate={onNavigate}>
    <div className="mobile-catalog-materials">
      {Object.entries(materialLabels).map(([material, label]) => <MenuBranch key={material} className="mobile-catalog-material" material={material} label={label} to={`/catalogo?material=${material}`} onNavigate={onNavigate}>
        <div className="mobile-catalog-collections">
          {[{ key: '', label: 'Todas las piezas' }, ...categories].map(category => <Link key={category.key || 'all'}
            to={`/catalogo?${new URLSearchParams({ material, ...(category.key ? { categoria: category.key } : {}) })}`}
            aria-current={isCatalog && selectedMaterial === material && selectedCategory === category.key ? 'page' : undefined}
            onClick={onNavigate}>{category.label}</Link>)}
        </div>
      </MenuBranch>)}
    </div>
  </MenuBranch>;
}
