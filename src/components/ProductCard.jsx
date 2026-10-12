import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import StatusBadge from './StatusBadge.jsx';
import ProductIcon from './ProductIcon.jsx';
import { formatDate, formatDuration } from '../utils/dateUtils.js';
import { getWarrantyStatus, daysLeftText } from '../utils/warrantyUtils.js';

// Card layout used on phones instead of the wide table
export default function ProductCard({ product: p, onDelete }) {
  const s = getWarrantyStatus(p);
  return (
    <article className="product-card">
      <div className="pc-head">
        <span className="cell-icon"><ProductIcon name={p.productName} /></span>
        <h3>{p.productName}</h3>
        <StatusBadge status={s} />
      </div>
      <dl>
        <div><dt>Purchased</dt><dd>{formatDate(p.purchaseDate)}</dd></div>
        <div><dt>Warranty</dt><dd>{formatDuration(p.warrantyDurationMonths)}</dd></div>
        <div><dt>Expires</dt><dd>{formatDate(s.expiry)}</dd></div>
        <div><dt>Service</dt><dd>{formatDate(p.serviceDate)}</dd></div>
      </dl>
      <p className="muted small">{daysLeftText(s)}</p>
      <div className="pc-actions">
        <Link className="btn" to={`/products/${p.id}`}><FiEye /> View</Link>
        <Link className="btn" to={`/products/${p.id}/edit`}><FiEdit2 /> Edit</Link>
        <button className="btn btn-danger-outline" onClick={() => onDelete(p)}><FiTrash2 /> Delete</button>
      </div>
    </article>
  );
}
