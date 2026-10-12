import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import StatusBadge from '../components/StatusBadge.jsx';
import ProductIcon from '../components/ProductIcon.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useToast } from '../components/Toast.jsx';
import { getProduct, deleteProduct, getErrorMessage } from '../services/api.js';
import { getWarrantyStatus, daysLeftText } from '../utils/warrantyUtils.js';
import { formatDate, formatDuration } from '../utils/dateUtils.js';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const notify = useToast();

  useEffect(() => {
    getProduct(id).then(setProduct).catch((e) => setError(getErrorMessage(e)));
  }, [id]);

  const remove = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteProduct(id);
      notify(`Deleted “${product.productName}”.`);
      navigate('/products');
    } catch (e) {
      notify(getErrorMessage(e), 'error');
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (error) return <div className="state-box error-box" role="alert"><p>{error}</p><Link to="/products" className="btn">Back to products</Link></div>;
  if (!product) return <LoadingSpinner text="Loading product…" />;

  const s = getWarrantyStatus(product);
  const rows = [
    ['Purchase date', formatDate(product.purchaseDate)],
    ['Warranty duration', formatDuration(product.warrantyDurationMonths)],
    ['Warranty expiry', `${formatDate(s.expiry)} (${daysLeftText(s)})`],
    ['Service date', formatDate(product.serviceDate)],
    ['Notes', product.notes || '—'],
  ];

  return (
    <>
      <Link to="/products" className="back-link"><FiArrowLeft /> All products</Link>
      <section className="card details">
        <div className="details-head">
          <span className="cell-icon big"><ProductIcon name={product.productName} /></span>
          <h2>{product.productName}</h2>
          <StatusBadge status={s} />
        </div>
        <dl className="details-list">
          {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <div className="form-actions">
          <Link to={`/products/${id}/edit`} className="btn btn-primary"><FiEdit2 /> Edit product</Link>
          <button className="btn btn-danger-outline" onClick={() => setConfirming(true)}><FiTrash2 /> Delete product</button>
        </div>
      </section>
      {confirming && <ConfirmDialog title="Delete this product?" message={`“${product.productName}” will be removed permanently.`} busy={deleting} onConfirm={remove} onCancel={() => setConfirming(false)} />}
    </>
  );
}
