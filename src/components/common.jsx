// src/components/common.jsx
import React from 'react';

export function Avatar({ name, size = 'md', color = '#0066FF' }) {
  const initials = name ? name.charAt(0).toUpperCase() : '?';
  
  const sizeStyles = {
    sm: { width: '32px', height: '32px', fontSize: '14px' },
    md: { width: '40px', height: '40px', fontSize: '16px' },
    lg: { width: '48px', height: '48px', fontSize: '18px' }
  };

  const style = {
    ...sizeStyles[size],
    backgroundColor: color,
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    flexShrink: 0
  };

  return <div style={style}>{initials}</div>;
}

export function StatusDot({ status }) {
  const color = status === 'online' ? '#10B981' : '#EF4444'; // verde : rojo
  return (
    <span
      style={{
        width: '10px',
        height: '10px',
        backgroundColor: color,
        borderRadius: '50%',
        display: 'inline-block'
      }}
    />
  );
}