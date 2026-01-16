// =====================================================
// TOAST COMPONENT
// =====================================================

import './Toast.css';

const iconMap = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function Toast({ message, type = 'info', onClose }) {
  const icon = iconMap[type] || iconMap.info;

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
