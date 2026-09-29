import React from 'react';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'emerald', // 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose' | 'neutral'
  size = 'md', // 'sm' | 'md'
  icon = null,
  className = '',
}) => {
  return (
    <span className={`badge-custom badge-${variant} badge-${size} ${className}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
};
