import React from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner = ({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  fullPage = false,
  message = null,
}) => {
  const spinnerContent = (
    <div className={`spinner-container ${size}`}>
      <div className="spinner-chess-ring">
        <div className="spinner-core" />
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="spinner-fullpage-backdrop">{spinnerContent}</div>;
  }

  return spinnerContent;
};
