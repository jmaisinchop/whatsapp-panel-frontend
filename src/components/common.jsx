import React from 'react';
import PropTypes from 'prop-types';

export function Avatar({ name, size = 'md', className = '' }) {
  const initials = name ? name.charAt(0).toUpperCase() : '?';
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };


  const colors = [
    'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-emerald-600', 'bg-rose-600'
  ];
  const colorClass = colors[name ? name.length % colors.length : 0];

  return (
    <div className={`
      ${sizeClasses[size] || sizeClasses.md} 
      ${className.includes('bg-') ? '' : colorClass}
      ${className}
      rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0
    `}>
      {initials}
    </div>
  );
}


Avatar.propTypes = {
  name: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']), 
  className: PropTypes.string,
};

export function StatusDot({ status }) {
  return (
    <span className={`
      w-2.5 h-2.5 rounded-full inline-block
      ${status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}
      ring-2 ring-white
    `} />
  );
}

StatusDot.propTypes = {
  status: PropTypes.string,
};