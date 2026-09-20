import { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

/**
 * ToastProvider — envuelve la app (en App.jsx) para habilitar toasts en
 * cualquier componente hijo vía el hook useToast().
 *
 * Uso:
 *   // App.jsx
 *   <ToastProvider>
 *     <Navbar ... />
 *     <Routes>...</Routes>
 *   </ToastProvider>
 *
 *   // en cualquier componente hijo
 *   const { showToast } = useToast();
 *   showToast('Producto actualizado', 'success');
 *   showToast('No se pudo guardar', 'error');
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3200) => {
    const id = toastId++;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-[0_20px_45px_rgba(11,37,27,0.12)] backdrop-blur-md animate-[fadeSlideUp_0.25s_ease-out] ${
              toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-gold-200 bg-forest-900 text-ivory-soft'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-400" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Cerrar notificación"
              className="shrink-0 opacity-70 transition hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return context;
};
