import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

export const Input = ({
  label,
  error,
  helperText,
  leftIcon = null,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || name;

  return (
    <div className={`input-group-custom ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label-custom">
          {label} {required && <span className="input-required">*</span>}
        </label>
      )}

      <div className="input-wrapper-custom">
        {leftIcon && <span className="input-icon-left">{leftIcon}</span>}

        <input
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input-field-custom ${leftIcon ? 'with-left-icon' : ''} ${
            isPassword ? 'with-right-icon' : ''
          }`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="input-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <p className="input-error-text">{error}</p>
      ) : helperText ? (
        <p className="input-helper-text">{helperText}</p>
      ) : null}
    </div>
  );
};
