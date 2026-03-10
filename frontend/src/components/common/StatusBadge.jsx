export default function StatusBadge({ status }) {
  const labels = {
    pending: '⏳ Pending',
    accepted: '✅ Accepted',
    on_the_way: '🚑 On the Way',
    arrived: '📍 Arrived',
    completed: '✔️ Completed',
    cancelled: '✖️ Cancelled',
    available: '🟢 Available',
    busy: '🔴 Busy',
    offline: '⚫ Offline',
  };
  return (
    <span className={`badge badge-${status}`}>
      {labels[status] || status}
    </span>
  );
}
