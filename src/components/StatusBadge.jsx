import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiHelpCircle } from 'react-icons/fi';

const icons = { active: <FiCheckCircle />, expiring: <FiAlertTriangle />, expired: <FiXCircle />, unknown: <FiHelpCircle /> };

// Colour + icon + text, so the status is not shown by colour alone
export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status.key}`}>{icons[status.key]}{status.label}</span>;
}
