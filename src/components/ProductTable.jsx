import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import StatusBadge from './StatusBadge.jsx';
import ProductIcon from './ProductIcon.jsx';
import { formatDate, formatDuration } from '../utils/dateUtils.js';
import { getWarrantyStatus } from '../utils/warrantyUtils.js';

// compact = dashboard version (4 columns, no actions)
export default function ProductTable({ products, onDelete, compact = false }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Product</th><th>Purchased</th>
            {!compact && <th>Warranty</th>}
            <th>Warranty expiry</th>
            {!compact && <th>Service date</th>}
            <th>Status</th>
            {!compact && <th><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const s = getWarrantyStatus(p);
            return (
              <tr key={p.id}>
                <td><Link to={`/products/${p.id}`} className="cell-name"><span className="cell-icon"><ProductIcon name={p.productName} /></span>{p.productName}</Link></td>
                <td>{formatDate(p.purchaseDate)}</td>
                {!compact && <td>{formatDuration(p.warrantyDurationMonths)}</td>}
                <td>{formatDate(s.expiry)}</td>
                {!compact && <td>{formatDate(p.serviceDate)}</td>}
                <td><StatusBadge status={s} /></td>
                {!compact && (
                  <td className="actions">
                    <Link className="icon-btn" to={`/products/${p.id}`} aria-label={`View ${p.productName}`}><FiEye /></Link>
                    <Link className="icon-btn" to={`/products/${p.id}/edit`} aria-label={`Edit ${p.productName}`}><FiEdit2 /></Link>
                    <button className="icon-btn danger" onClick={() => onDelete(p)} aria-label={`Delete ${p.productName}`}><FiTrash2 /></button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
