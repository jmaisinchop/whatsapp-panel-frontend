import React from 'react';
import PropTypes from 'prop-types';
import { Inbox } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Inbox,
  title = 'No hay datos',
  description = 'No se encontraron resultados para mostrar.',
  action,
  actionLabel = 'Acción'
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px] animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
        <Icon size={32} className="text-slate-400" />
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-1">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <button 
          onClick={action}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.func,  
  actionLabel: PropTypes.string,
};