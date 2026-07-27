const STATUS_MAP = {
  waiting: { className: 'badge-indigo', label: 'Waiting' },
  called: { className: 'badge-success', label: 'Called' },
  're-queued': { className: 'badge-indigo', label: 'Re-queued' },
  served: { className: 'badge-success', label: 'Served' },
  'no-show': { className: 'badge-danger', label: 'No-show' },
  cancelled: { className: 'badge-danger', label: 'Cancelled' },
  active: { className: 'badge-success', label: 'Active' },
  inactive: { className: 'badge-danger', label: 'Inactive' },
  'on-break': { className: 'badge-warning', label: 'On Break' },
};

export default function StatusBadge({ status, label }) {
  const config = STATUS_MAP[status] || { className: 'badge-indigo', label: status };
  return <span className={`badge ${config.className}`}>{label || config.label}</span>;
}
