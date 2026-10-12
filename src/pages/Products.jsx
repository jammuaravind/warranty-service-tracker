import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiRefreshCw } from 'react-icons/fi';
import ProductTable from '../components/ProductTable.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useToast } from '../components/Toast.jsx';
import useProducts from '../hooks/useProducts.js';
import { deleteProduct, getErrorMessage, isMockMode, toggleMockMode } from '../services/api.js';
import { getWarrantyStatus } from '../utils/warrantyUtils.js';

export default function Products() {
  const { products, setProducts, loading, error, reload } = useProducts();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState('all');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const notify = useToast();
  const query = params.get('q') || ''; // the search text lives in the URL so the top bar can set it

  const visible = useMemo(() => products.filter((p) =>
    p.productName.toLowerCase().includes(query.toLowerCase()) &&
    (status === 'all' || getWarrantyStatus(p).key === status)
  ), [products, query, status]);

  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteProduct(toDelete.id);
      setProducts((list) => list.filter((p) => p.id !== toDelete.id)); // update the UI immediately
      notify(`Deleted “${toDelete.productName}”.`);
    } catch (e) {
      notify(getErrorMessage(e), 'error');
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <>
      <div className="page-head">
        <div><h2>Products</h2><p className="muted">{products.length} saved</p></div>
        <Link to="/products/new" className="btn btn-primary"><FiPlus /> Add product</Link>
      </div>

      <div className="toolbar">
        <div className="search search-wide">
          <FiSearch aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})} placeholder="Search by product name" aria-label="Search by product name" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by warranty status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? <LoadingSpinner text="Loading products…" /> : error ? (
        <div className="state-box error-box" role="alert">
          <p>{error}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button className="btn" onClick={reload}><FiRefreshCw /> Try again</button>
            {!isMockMode && (
              <button className="btn btn-primary" onClick={() => toggleMockMode(true)}>
                Switch to Demo Mode
              </button>
            )}
          </div>
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No products yet" text="Add a product to track its warranty and service dates." actionLabel="Add product" actionTo="/products/new" />
      ) : visible.length === 0 ? (
        <EmptyState title="No matching products" text="Try a different search or status filter." />
      ) : (
        <>
          <div className="card only-desktop"><ProductTable products={visible} onDelete={setToDelete} /></div>
          <div className="card-list only-mobile">{visible.map((p) => <ProductCard key={p.id} product={p} onDelete={setToDelete} />)}</div>
        </>
      )}

      {toDelete && (
        <ConfirmDialog title="Delete this product?" message={`“${toDelete.productName}” will be removed permanently.`} busy={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      )}
    </>
  );
}
