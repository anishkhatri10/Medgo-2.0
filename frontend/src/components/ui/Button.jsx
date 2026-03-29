import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  full = false,
  icon: Icon,
  loading = false,
  as: Component = 'button',
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/40 hover:-translate-y-0.5',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-white border border-dark-500 hover:border-dark-400',
    outline: 'bg-transparent hover:bg-red-600/10 text-red-400 border border-red-600/50 hover:text-white',
    danger: 'bg-red-900/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-800/50 hover:border-red-600',
    ghost: 'text-gray-400 hover:text-white hover:bg-dark-700/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : '';
  const fullWidth = full ? 'w-full' : '';

  return (
    <Component
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth} ${disabledStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon size={20} />
      ) : null}
      {children}
    </Component>
  );
};

export default Button;
