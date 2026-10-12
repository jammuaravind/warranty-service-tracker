import { Link } from 'react-router-dom';
import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ title, text, actionLabel, actionTo }) {
  return (
    <div className="state-box">
      <FiInbox className="state-icon" />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionTo && <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>}
    </div>
  );
}
