import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import usePressFeedback from '../hooks/usePressFeedback';
import '../styles/mobile-filters.css';

/** Native modal focus management, with an interruptible spring on the grab handle. */
export default function BottomSheet({ id, open, onClose, title, children, className = '', closeLabel = 'Cerrar filtros', mobileBreakpoint = 767, returnFocusSelector, dismissible = true }) {
  const pressFeedback = usePressFeedback('button, a');
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const titleId = useId();
  const motion = useRef({ y: 0, velocity: 0, frame: 0, drag: null, moved: false });
  const closeHandler = useRef(onClose);
  const canDismiss = useRef(dismissible);
  useEffect(() => { closeHandler.current = onClose; canDismiss.current = dismissible; }, [onClose, dismissible]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const state = motion.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const mobile = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const viewport = window.visualViewport;
    const resize = () => dialog.style.setProperty('--sheet-viewport', `${viewport?.height || window.innerHeight}px`);
    resize();
    viewport?.addEventListener('resize', resize);
    window.addEventListener('resize', resize);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    closeRef.current.focus({ preventScroll: true });

    const paint = () => {
      dialog.style.setProperty('--sheet-y', `${state.y}px`);
      dialog.style.setProperty('--sheet-scrim', String(.4 * Math.max(0, 1 - state.y / Math.max(1, dialog.offsetHeight))));
    };
    state.paint = paint;
    state.y = reduced.matches ? 0 : mobile.matches ? dialog.offsetHeight : 20;
    state.velocity = 0;
    state.drag = null;
    state.moved = false;
    paint();
    state.animateTo = (target, finish) => {
      cancelAnimationFrame(state.frame);
      if (reduced.matches) {
        state.y = target;
        state.velocity = 0;
        paint();
        finish?.();
        return;
      }
      let last = performance.now();
      const tick = now => {
        const dt = Math.min((now - last) / 1000, .032);
        last = now;
        // Critical damping; retain the current position and velocity on retarget.
        for (let i = 0; i < 4; i++) {
          state.velocity += (-380 * (state.y - target) - 39 * state.velocity) * dt / 4;
          state.y += state.velocity * dt / 4;
        }
        paint();
        if (Math.abs(state.y - target) < .5 && Math.abs(state.velocity) < 5) {
          state.y = target;
          state.velocity = 0;
          paint();
          state.frame = 0;
          finish?.();
        } else state.frame = requestAnimationFrame(tick);
      };
      state.frame = requestAnimationFrame(tick);
    };
    state.close = () => {
      if (!canDismiss.current) { state.animateTo(0); return; }
      state.animateTo(mobile.matches ? dialog.offsetHeight + 24 : 20, () => { if (canDismiss.current) closeHandler.current(); else state.animateTo(0); });
    };
    state.animateTo(0);
    const handleCancel = event => { event.preventDefault(); state.close?.(); };
    const protectPendingSave = event => {
      if (event.key === 'Escape' && !canDismiss.current) { event.preventDefault(); event.stopPropagation(); }
    };
    dialog.addEventListener('cancel', handleCancel);
    document.addEventListener('keydown', protectPendingSave, true);
    const cancelDrag = () => {
      if (!state.drag) return;
      state.drag = null;
      state.velocity = 0;
      state.animateTo(0);
    };
    window.addEventListener('blur', cancelDrag);
    return () => {
      cancelAnimationFrame(state.frame);
      state.drag = null;
      state.close = null;
      dialog.removeEventListener('cancel', handleCancel);
      document.removeEventListener('keydown', protectPendingSave, true);
      window.removeEventListener('blur', cancelDrag);
      viewport?.removeEventListener('resize', resize);
      window.removeEventListener('resize', resize);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      const returnTo = previousFocus?.isConnected && previousFocus.getClientRects().length ? previousFocus
        : returnFocusSelector ? [...document.querySelectorAll(returnFocusSelector)].find(element => element.getClientRects().length) : null;
      returnTo?.focus({ preventScroll:true });
    };
  }, [open, mobileBreakpoint, returnFocusSelector]);

  const start = event => {
    if (!canDismiss.current || event.button !== 0 || !event.isPrimary || !window.matchMedia(`(max-width: ${mobileBreakpoint}px)`).matches) return;
    const state = motion.current;
    cancelAnimationFrame(state.frame);
    state.moved = false;
    state.drag = { id: event.pointerId, start: event.clientY, origin: state.y, lastY: event.clientY, time: event.timeStamp };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = event => {
    const state = motion.current;
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.id) return;
    const delta = event.clientY - drag.start;
    state.moved ||= Math.abs(delta) > 6;
    const elapsed = event.timeStamp - drag.time;
    if (elapsed > 0) state.velocity = (event.clientY - drag.lastY) / elapsed * 1000;
    drag.lastY = event.clientY;
    drag.time = event.timeStamp;
    state.y = Math.max(0, drag.origin + delta);
    state.paint();
  };
  const end = (event, cancelled = false) => {
    const state = motion.current;
    if (!state.drag || state.drag.id !== event.pointerId) return;
    if (event.timeStamp - state.drag.time > 100 || cancelled) state.velocity = 0;
    const dismiss = !cancelled && state.y + state.velocity * .18 > Math.min(120, dialogRef.current.offsetHeight * .28);
    state.drag = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (dismiss) state.close?.();
    else state.animateTo?.(0);
  };

  return <dialog id={id} ref={dialogRef} className={`filter-sheet ${className}`} aria-labelledby={titleId} {...pressFeedback}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const r = event.currentTarget.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) motion.current.close?.();
    }}>
    <button type="button" className="filter-sheet-grab" disabled={!dismissible} aria-label={`${closeLabel}; también puedes deslizar hacia abajo`}
      onPointerDown={start} onPointerMove={move} onPointerUp={event => end(event)}
      onPointerCancel={event => end(event, true)} onLostPointerCapture={event => end(event, true)}
      onClick={event => { if (event.detail === 0 || !motion.current.moved) motion.current.close?.(); }}><span aria-hidden="true" /></button>
    <header className="filter-sheet-heading"><h2 id={titleId}>{title}</h2><button ref={closeRef} type="button" className="filter-sheet-close" disabled={!dismissible} aria-label={closeLabel} onClick={() => motion.current.close?.()}><X size={22} aria-hidden="true" /></button></header>
    {open && children}
  </dialog>;
}
