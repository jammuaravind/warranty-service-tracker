import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm.jsx';
import { useToast } from '../components/Toast.jsx';
import { createProduct, getErrorMessage, isMockMode, toggleMockMode } from '../services/api.js';

export default function AddProduct() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const notify = useToast();

  const save = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      await createProduct(data);
      notify('Product added.');
      navigate('/products');
    } catch (e) {
      setError(getErrorMessage(e));
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-head"><div><h2>Add product</h2><p className="muted">Fields marked * are required.</p></div></div>
      {error && (
        <div className="alert alert-error" role="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span>{error}</span>
          {!isMockMode && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
              onClick={() => toggleMockMode(true)}
            >
              Switch to Demo Mode
            </button>
          )}
        </div>
      )}
      <ProductForm onSubmit={save} submitting={submitting} submitLabel="Save product" />
    </>
  );
}
