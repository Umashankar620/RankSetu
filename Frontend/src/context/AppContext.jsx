'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Persist dark mode in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ranksetu_dark');
      if (saved !== null) setDarkModeState(saved === 'true');
    }
  }, []);

  const setDarkMode = (val) => {
    setDarkModeState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ranksetu_dark', String(val));
    }
  };

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <AppContext.Provider value={{ darkMode, setDarkMode, showToast }}>
      {children}
      {/* Toast renderer */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold max-w-xs animate-in slide-in-from-bottom-2 duration-300 ${
                t.type === 'error'
                  ? 'bg-rose-600 text-white'
                  : t.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
