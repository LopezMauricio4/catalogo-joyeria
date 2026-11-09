import { useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from './Modal';
import { business } from '../data/legal';
import { addCatalogLink, buildWhatsAppLink, getCatalogOrigin } from '../utils/whatsappGenerator';

const advisors = [
  { name: 'Mauricio López', number: business.whatsappNumber, phone: business.phone },
  { name: 'Kevin Almario', number: '573155556523', phone: '+57 315 555 6523' },
];

export default function WhatsAppAdvisorButton({ message, children, ...buttonProps }) {
  const [open, setOpen] = useState(false);
  const advisorMessage = addCatalogLink(message, getCatalogOrigin(window.location.origin));

  return <>
    <button {...buttonProps} type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>{children}</button>
    {open && createPortal(<Modal open={open} onClose={() => setOpen(false)} title="Elige un asesor">
      <p className="mb-4 text-sm">Selecciona el WhatsApp al que quieres escribir.</p>
      <div className="grid gap-2">
        {advisors.map(({ name, number, phone }) => (
          <a key={number} className="shop-button shop-button-secondary" href={buildWhatsAppLink(advisorMessage, number)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <img src="/asesores-alpez.png" alt="" width={48} height={48} className="size-12 shrink-0 rounded-full object-cover" />
            <span className="flex min-w-0 flex-1 flex-col text-left">
              <span>{name}</span>
              <span className="text-xs tabular-nums">{phone}</span>
            </span>
          </a>
        ))}
      </div>
    </Modal>, document.body)}
  </>;
}
