import { useEffect, useRef, useState } from 'react';
import { GripVertical, X, ZoomIn } from 'lucide-react';
import ProductImage from './ProductImage';
import Modal from './Modal';
import { moveImage } from '../utils/imageOrder';

function GalleryImage({ image, index, onRemove, handle, tileProps }) {
  const photo = useRef(null);
  const [zoom, setZoom] = useState('');
  useEffect(() => {
    if (!image.file) return;
    const url = URL.createObjectURL(image.file);
    photo.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [image.file]);
  const label = image.file?.name || `Imagen ${index + 1}`;
  return <div className="editor-image-tile" data-gallery-id={image.id} {...tileProps}>
    <button type="button" className="editor-image-open" onClick={() => setZoom(photo.current.src)} aria-label={`Ampliar ${label}`}><img ref={photo} src={image.src || undefined} alt={label} draggable={false} /><span aria-hidden="true"><ZoomIn size={16} /></span></button>
    <button type="button" className="editor-image-remove" onClick={onRemove} aria-label={`Quitar ${label}`}><X size={16} /></button>
    <div className="editor-image-order">{handle}<span>{index === 0 ? '1 · Portada' : `Imagen ${index + 1}`}</span></div>
    <Modal open={Boolean(zoom)} onClose={() => setZoom('')} title="Vista previa de la imagen" className="editor-image-dialog"><ProductImage src={zoom || undefined} alt={label} className="editor-image-expanded" /></Modal>
  </div>;
}

export default function ProductGalleryEditor({ images, onChange }) {
  const dragging = useRef(null);
  const pointer = useRef(null);
  const reorder = (source, target) => onChange(current => moveImage(current, source, target));
  return <div className="editor-image-selection" aria-label="Imágenes del producto en orden">
    {images.map((image, index) => <GalleryImage key={image.id} image={image} index={index}
      onRemove={() => onChange(current => current.filter(value => value.id !== image.id))}
      tileProps={{ draggable: true,
        onDragStart: event => { dragging.current = image.id; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', image.id); },
        onDragOver: event => { if (dragging.current) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } },
        onDrop: event => { event.preventDefault(); if (dragging.current) reorder(dragging.current, image.id); dragging.current = null; },
        onDragEnd: () => { dragging.current = null; },
      }}
      handle={<button type="button" className="editor-image-drag" draggable={false} aria-label={`Mover imagen ${index + 1}. Usa las flechas izquierda y derecha para ordenar.`} title="Arrastra para ordenar"
        onDragStart={event => event.preventDefault()}
        onPointerDown={event => { if (event.button !== 0) return; pointer.current = { id: image.id, pointerId: event.pointerId }; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={event => { if (pointer.current?.pointerId !== event.pointerId) return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-gallery-id]')?.getAttribute('data-gallery-id'); if (target) reorder(pointer.current.id, target); }}
        onPointerUp={() => { pointer.current = null; }} onPointerCancel={() => { pointer.current = null; }}
        onKeyDown={event => { const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0; if (!direction) return; event.preventDefault(); const target = images[index + direction]; if (target) reorder(image.id, target.id); }}
      ><GripVertical size={16} /></button>} />)}
  </div>;
}
