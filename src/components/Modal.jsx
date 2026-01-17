import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showClose = true 
}) {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop (Botón nativo para cerrar al hacer clic fuera) */}
      <button 
        type="button"
        className="absolute inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm transition-opacity border-none cursor-default focus:outline-none" 
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      {/* Contenedor del Modal (Sin onClick innecesario) */}
      <dialog 
        open
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`
          relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl transform transition-all
          flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200
          p-0 m-0 border-none text-left
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 id="modal-title" className="text-lg font-semibold text-slate-800">{title}</h3>
            {showClose && (
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </dialog>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showClose: PropTypes.bool,
};

Modal.Footer = function ModalFooter({ children }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
      {children}
    </div>
  );
};

Modal.Footer.propTypes = {
  children: PropTypes.node,
};