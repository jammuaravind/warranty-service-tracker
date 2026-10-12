import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useToast } from '../components/Toast.jsx';
import { getProduct, updateProduct, getErrorMessage } from '../services/api.js';

export default function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const notify = useToast();

  useEffect(() => {
    getProduct(id).then(setProduct).catch((e) => setLoadError(getErrorMessage(e)));
  }, [id]);

  const save = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      await updateProduct(id, data);
      notify('Changes saved.');
      navigate('/products');
    } catch (e) {
      setError(getErrorMessage(e));
      setSubmitting(false);
    }
  };

  if (loadError) return <div className="state-box error-box" role="alert"><p>{loadError}</p><Link to="/products" className="btn">Back to products</Link></div>;
  if (!product) return <LoadingSpinner text="Loading product…" />;

  return (
    <>
      <div className="page-head"><div><h2>Edit product</h2><p className="muted">{product.productName}</p></div></div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {/* serviceDate and notes can be null from the API, so they become empty strings for the inputs */}
      <ProductForm initialValues={{ ...product, serviceDate: product.serviceDate || '', notes: product.notes || '' }} onSubmit={save} submitting={submitting} submitLabel="Save changes" />
    </>
  );
}
