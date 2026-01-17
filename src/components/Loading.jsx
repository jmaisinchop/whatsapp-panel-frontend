import React from 'react';
import PropTypes from 'prop-types';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[3px]',
    lg: 'w-10 h-10 border-4',
    xl: 'w-14 h-14 border-[5px]',
  };

  return (
    <div className={`
      ${sizes[size]} 
      border-slate-200 border-t-blue-600 rounded-full animate-spin 
      ${className}
    `} />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
};

export function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-slate-50">
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm font-medium animate-pulse">{message}</p>
    </div>
  );
}

LoadingScreen.propTypes = {
  message: PropTypes.string,
};

export function LoadingOverlay({ message = 'Cargando...' }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white shadow-xl border border-slate-100">
        <Spinner size="lg" />
        <p className="text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

LoadingOverlay.propTypes = {
  message: PropTypes.string,
};

export default Spinner;