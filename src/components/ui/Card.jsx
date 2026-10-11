import React from 'react';

export const Card = ({ children, className = '', hover = true, glass = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-5 transition-all duration-200 ${
        glass
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/60 dark:border-slate-800/60'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
      } ${hover ? 'hover:shadow-md hover:-translate-y-0.5' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
