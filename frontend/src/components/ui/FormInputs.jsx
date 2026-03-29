import React from 'react';

export const Input = React.forwardRef(({ 
  label, 
  error, 
  icon: Icon,
  full = true,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Icon size={20} />
          </div>
        )}
        <input
          ref={ref}
          className={`input-field ${Icon ? 'pl-12' : ''} ${full ? 'w-full' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export const TextArea = React.forwardRef(({ 
  label, 
  error, 
  full = true,
  rows = 4,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`input-field resize-none ${full ? 'w-full' : ''} ${className}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export const Select = React.forwardRef(({ 
  label, 
  error, 
  options = [],
  full = true,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <select
        ref={ref}
        className={`input-field appearance-none cursor-pointer ${full ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export const FormGroup = ({ children, className = '' }) => (
  <div className={`form-group ${className}`}>{children}</div>
);
