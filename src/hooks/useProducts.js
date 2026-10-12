import { useCallback, useEffect, useState } from 'react';
import { getProducts, getErrorMessage } from '../services/api.js';

// Loads all products and exposes loading / error state plus a reload function
export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProducts(await getProducts());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { products, setProducts, loading, error, reload: load };
}
