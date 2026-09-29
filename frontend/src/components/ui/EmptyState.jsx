import React from 'react';
import { Button } from './Button';
import './EmptyState.css';

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div className={`empty-state-custom ${className}`}>
      {icon && <div className="empty-state-icon-bubble">{icon}</div>}
      <h4 className="empty-state-title">{title}</h4>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionLabel && onAction && (
        <div className="empty-state-action">
          <Button
            variant="primary"
            size="md"
            leftIcon={actionIcon}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
