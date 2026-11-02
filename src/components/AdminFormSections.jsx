import { Children, useId, useRef, useState } from 'react';

/** Panels stay mounted: files, draft values and component state survive tab changes. */
export default function AdminFormSections({ labels, children }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const invalidCycle = useRef(false);
  const panels = Children.toArray(children);
  const activate = (index, container) => {
    setActive(index);
    container.querySelectorAll('[role="tab"]')[index]?.focus();
  };
  return <div className="admin-form-sections" onInvalidCapture={event => {
    const panel = event.target.closest('[data-admin-panel]');
    if (invalidCycle.current) { if (panel?.hidden) event.preventDefault(); return; }
    invalidCycle.current = true;
    requestAnimationFrame(() => { invalidCycle.current = false; });
    if (!panel?.hidden) return;
    event.preventDefault();
    setActive(Number(panel.dataset.adminPanel));
    const field = event.target;
    requestAnimationFrame(() => { field.focus(); field.reportValidity(); });
  }}>
    <div className="admin-form-tabs" role="tablist" aria-label="Secciones del formulario" onKeyDown={event => {
      const index = ['ArrowRight', 'ArrowLeft'].includes(event.key) ? (active + (event.key === 'ArrowRight' ? 1 : -1) + labels.length) % labels.length : event.key === 'Home' ? 0 : event.key === 'End' ? labels.length - 1 : null;
      if (index === null) return;
      event.preventDefault(); activate(index, event.currentTarget);
    }}>
      {labels.map((label, index) => <button key={label} type="button" role="tab" id={`${id}-tab-${index}`} aria-selected={active === index} aria-controls={`${id}-panel-${index}`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)}>{label}</button>)}
    </div>
    {panels.map((panel, index) => <div key={index} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} data-admin-panel={index} hidden={active !== index} className="admin-form-panel">{panel}</div>)}
  </div>;
}
