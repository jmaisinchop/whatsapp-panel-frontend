// =====================================================
// LOADING COMPONENTS
// =====================================================

import './Loading.css';

export function Spinner({ size = 'md', className = '' }) {
  return <div className={`spinner spinner-${size} ${className}`} />;
}

export function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <div className="loading-screen">
      <Spinner size="lg" />
      <p>{message}</p>
    </div>
  );
}

export function LoadingOverlay({ message = 'Cargando...' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Spinner size="lg" />
        <p>{message}</p>
      </div>
    </div>
  );
}

export default Spinner;
