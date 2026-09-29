import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import './Alert.css';

export const Alert = ({
  variant = 'info', // 'success' | 'error' | 'warning' | 'info'
  title,
  children,
  onClose,
  className = '',
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className={`alert-custom alert-${variant} ${className}`}>
      <span className="alert-icon">{getIcon()}</span>
      <div className="alert-body">
        {title && <h5 className="alert-title">{title}</h5>}
        <div className="alert-message">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
