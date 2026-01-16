// =====================================================
// EMPTY STATE COMPONENT
// =====================================================

import { Inbox } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({ 
  icon: Icon = Inbox,
  title = 'No hay datos',
  description = 'No se encontraron resultados',
  action,
  actionLabel = 'Acción'
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {action && (
        <button className="btn-primary" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
