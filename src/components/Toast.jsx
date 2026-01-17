import PropTypes from 'prop-types';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const styles = {
  success: 'border-l-emerald-500 bg-emerald-50/50',
  error: 'border-l-rose-500 bg-rose-50/50',
  warning: 'border-l-amber-500 bg-amber-50/50',
  info: 'border-l-blue-500 bg-blue-50/50',
};

export default function Toast({ message, type = 'info', onClose }) {
  return (
    <div className={`
      flex items-center gap-3 p-4 min-w-[320px] bg-white shadow-lg rounded-xl border border-slate-100
      border-l-4 ${styles[type]} animate-in slide-in-from-right-full duration-300
    `}>
      <span className="flex-shrink-0">{icons[type]}</span>
      <p className="flex-1 text-sm font-medium text-slate-700">{message}</p>
      <button 
        type="button"
        onClick={onClose} 
        className="text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onClose: PropTypes.func,
};