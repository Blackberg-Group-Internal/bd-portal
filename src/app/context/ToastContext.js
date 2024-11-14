import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'primary') => {
    const id = Date.now(); 
    setToasts((prevToasts) => [...prevToasts, { id, message, variant }]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast show bg-${toast.variant} text-white`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-body">{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
