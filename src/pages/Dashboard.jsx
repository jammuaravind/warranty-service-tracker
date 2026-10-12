import { Link } from 'react-router-dom';
import { FiBox, FiCheckCircle, FiAlertTriangle, FiXCircle, FiPlus, FiRefreshCw } from 'react-icons/fi';
import StatCard from '../components/StatCard.jsx';
import ProductTable from '../components/ProductTable.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import useProducts from '../hooks/useProducts.js';
import { getDashboardStats, getUpcomingExpirations, getUpcomingServices, daysLeftText } from '../utils/warrantyUtils.js';
import { formatDate } from '../utils/dateUtils.js';

import { isMockMode, toggleMockMode } from '../services/api.js';

export default function Dashboard() {
  const { products, loading, error, reload } = useProducts();

  if (loading) return <LoadingSpinner text="Loading your products…" />;
  if (error) {
    return (
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
    );
  }

  const stats = getDashboardStats(products);
  const recent = [...products].sort((a, b) => b.id - a.id).slice(0, 5);
  const expirations = getUpcomingExpirations(products).slice(0, 5);
  const services = getUpcomingServices(products).slice(0, 5);

  return (
    <>
      <div className="page-head">
        <div><h2>Overview</h2><p className="muted">Your warranties and service dates at a glance.</p></div>
        <Link to="/products/new" className="btn btn-primary"><FiPlus /> Add product</Link>
      </div>

      <section className="stats" aria-label="Summary">
        <StatCard label="Total products" value={stats.total} icon={<FiBox />} tone="primary" />
        <StatCard label="Active warranties" value={stats.active} icon={<FiCheckCircle />} tone="success" />
        <StatCard label="Expiring soon" value={stats.expiring} icon={<FiAlertTriangle />} tone="warning" />
        <StatCard label="Expired warranties" value={stats.expired} icon={<FiXCircle />} tone="error" />
      </section>

      {products.length === 0 ? (
        <EmptyState title="No products yet" text="Add your first product to start tracking its warranty." actionLabel="Add product" actionTo="/products/new" />
      ) : (
        <>
          <div className="two-col">
            <section className="card">
              <h3>Upcoming warranty expirations</h3>
              {expirations.length === 0 ? <p className="muted">No warranties are about to expire.</p> : (
                <ul className="list">
                  {expirations.map(({ product, status }) => (
                    <li key={product.id}>
                      <div><Link to={`/products/${product.id}`}>{product.productName}</Link><p className="muted small">{formatDate(status.expiry)} · {daysLeftText(status)}</p></div>
                      <StatusBadge status={status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="card">
              <h3>Upcoming service dates</h3>
              {services.length === 0 ? <p className="muted">No services are scheduled in the next 60 days.</p> : (
                <ul className="list">
                  {services.map(({ product, date }) => (
                    <li key={product.id}>
                      <Link to={`/products/${product.id}`}>{product.productName}</Link>
                      <span className="muted">{formatDate(date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <section className="card">
            <div className="card-head"><h3>Recently added</h3><Link to="/products">View all products</Link></div>
            <ProductTable products={recent} compact />
          </section>
        </>
      )}
    </>
  );
}
