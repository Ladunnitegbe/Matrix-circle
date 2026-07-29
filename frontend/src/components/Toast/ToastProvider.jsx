import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Toast from './Toast.jsx';

/**
 * ToastProvider / useToast — the practical way to actually use Toast:
 * wrap the app once, then call `showToast({...})` from anywhere. Each
 * toast auto-dismisses after `duration` ms (default 5000; pass
 * `duration: 0` to require manual dismissal).
 *
 * Usage:
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 *
 *   const { showToast } = useToast();
 *   showToast({ tone: 'error', message: 'This food listing is no longer available.' });
 */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, ...toast }]);
      if (toast.duration !== 0) {
        setTimeout(() => dismissToast(id), toast.duration || 5000);
      }
      return id;
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={() => dismissToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}
