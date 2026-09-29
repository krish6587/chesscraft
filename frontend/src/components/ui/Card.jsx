import React from 'react';
import './Card.css';

export const Card = ({
  children,
  className = '',
  glow = false,
  interactive = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`card-custom ${glow ? 'card-glow' : ''} ${interactive ? 'card-interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header-custom ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`card-title-custom ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`card-desc-custom ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`card-content-custom ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer-custom ${className}`}>{children}</div>
);
