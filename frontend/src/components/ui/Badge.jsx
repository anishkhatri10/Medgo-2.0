import React from 'react';

const Badge = ({ 
  status, 
  text, 
  size = 'md',
  icon: Icon,
  variant = 'default',
  className = ''
}) => {
  const statusMap = {
    pending: 'badge-pending',
    accepted: 'badge-accepted',
    on_the_way: 'badge-on_the_way',
    arrived: 'badge-arrived',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  };

  const sizeMap = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const baseStyles = `rounded-full font-semibold inline-flex items-center gap-1.5 transition-all duration-300`;
  const badgeStyle = statusMap[status] || statusMap.pending;

  return (
    <span className={`${baseStyles} ${badgeStyle} ${sizeMap[size]} ${className}`}>
      {Icon && <Icon size={16} />}
      {text || status}
    </span>
  );
};

export const StatusIndicator = ({ 
  status = 'online', 
  className = '' 
}) => {
  const statusStyles = {
    online: 'status-online',
    offline: 'status-offline',
    busy: 'status-busy',
  };

  return <div className={`${statusStyles[status]} ${className}`} />;
};

export const StatusBadgeWithDot = ({ 
  status, 
  text,
  className = ''
}) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <StatusIndicator status={status} />
    <Badge status={status} text={text} />
  </div>
);

export default Badge;
