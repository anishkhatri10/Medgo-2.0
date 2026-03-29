import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  padding = 'p-6'
}) => {
  const baseStyles = `bg-dark-800/60 border border-dark-600/50 rounded-2xl ${padding} shadow-xl backdrop-blur-sm`;
  const hoverStyles = hover ? 'hover:border-dark-500/80 hover:shadow-2xl transition-all duration-300' : '';
  const gradientStyles = gradient ? 'bg-gradient-to-br from-dark-700 to-dark-800' : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
