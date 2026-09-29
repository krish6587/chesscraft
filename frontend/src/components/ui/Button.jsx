import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`btn-custom btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="btn-spinner" />
      ) : (
        <>
          {leftIcon && <span className="btn-icon left">{leftIcon}</span>}
          <span className="btn-text">{children}</span>
          {rightIcon && <span className="btn-icon right">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
