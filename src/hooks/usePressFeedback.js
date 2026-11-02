import { useEffect, useRef } from 'react';

/** Pointer-down feedback also works when a touch browser defers CSS :active. */
export default function usePressFeedback(selector = 'button') {
  const pressed = useRef(null);
  const clear = () => {
    pressed.current?.removeAttribute('data-pressed');
    pressed.current = null;
  };
  useEffect(() => {
    const reset = () => {
      pressed.current?.removeAttribute('data-pressed');
      pressed.current = null;
    };
    window.addEventListener('blur', reset);
    window.addEventListener('pointerup', reset);
    window.addEventListener('pointercancel', reset);
    return () => {
      reset();
      window.removeEventListener('blur', reset);
      window.removeEventListener('pointerup', reset);
      window.removeEventListener('pointercancel', reset);
    };
  }, []);
  const start = event => {
    clear();
    const button = event.target.closest(selector);
    if (!button || button.disabled || button.matches('.filter-sheet-grab')) return;
    pressed.current = button;
    button.setAttribute('data-pressed', 'true');
  };
  return {
    onPointerDownCapture: event => { if (event.isPrimary && event.button === 0) start(event); },
    onPointerUpCapture: clear,
    onPointerCancelCapture: clear,
    onPointerMoveCapture: event => { if (event.target.closest(selector) !== pressed.current) clear(); },
    onKeyDownCapture: event => { if (event.key === ' ' || event.key === 'Enter') start(event); },
    onKeyUpCapture: clear,
    onBlurCapture: clear,
  };
}
