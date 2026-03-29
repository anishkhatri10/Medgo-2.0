import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = ''
}) => {
  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-dark-800 border border-dark-600/50 rounded-2xl shadow-2xl w-full mx-4 ${sizeMap[size]} animate-scale-in ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600/30">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-dark-600/30 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
