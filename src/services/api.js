import axios from 'axios';
import { supabase, isSupabaseConfigured } from './supabase.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const isMockMode =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  typeof window !== 'undefined' && localStorage.getItem('wst-demo-mode') === 'true';

export function toggleMockMode(enable) {
  if (typeof window !== 'undefined') {
    if (enable) {
      localStorage.setItem('wst-demo-mode', 'true');
    } else {
      localStorage.removeItem('wst-demo-mode');
    }
    window.location.reload();
  }
}

// One Axios instance for the whole app
const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Turns any Axios error into a message a user can understand
export function getErrorMessage(error) {
  if (error.mockMessage) return error.mockMessage;
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Try again.';
  if (!error.response) {
    return 'Cannot reach the server. Check that the Spring Boot backend is running on ' + BASE_URL + ', or switch to Demo mode.';
  }
  const serverMsg = error.response.data && error.response.data.message;
  switch (error.response.status) {
    case 400: return serverMsg || 'Some details are invalid. Check the form and try again.';
    case 404: return 'This product was not found. It may have been deleted.';
    case 500: return 'The server had a problem. Try again, or check the backend console.';
    default: return serverMsg || `Request failed (HTTP ${error.response.status}).`;
  }
}

// ---------- Optional DEMO mode (VITE_USE_MOCK=true) ----------
// Stores data in this browser's localStorage. NOTHING is saved to MySQL.
const KEY = 'wst-demo-products';
const INITIAL_DEMO_PRODUCTS = [
  {
    id: 1,
    productName: 'Asus ROG Gaming Laptop',
    purchaseDate: '2025-09-21',
    warrantyDurationMonths: 36,
    serviceDate: '2026-10-12',
    notes: 'Keep the invoice safely. Serial #ASUS-98234-X',
  },
  {
    id: 2,
    productName: 'Sony Noise-Canceling Headphones',
    purchaseDate: '2025-11-01',
    warrantyDurationMonths: 12,
    serviceDate: null,
    notes: 'Registered online for 1-year standard warranty',
  },
  {
    id: 3,
    productName: 'Samsung 4K Monitor',
    purchaseDate: '2024-04-10',
    warrantyDurationMonths: 12,
    serviceDate: null,
    notes: 'Purchased on Amazon',
  },
];

const read = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(KEY);
  if (stored === null) {
    localStorage.setItem(KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
    return INITIAL_DEMO_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};
const write = (list) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(list));
  }
};


const notFound = () => Object.assign(new Error('nf'), { mockMessage: 'This product was not found.' });

// Normalizes database row to frontend camelCase model
const normalize = (row) => ({
  id: row.id,
  productName: row.product_name || row.productName || '',
  purchaseDate: row.purchase_date || row.purchaseDate || '',
  warrantyDurationMonths: Number(row.warranty_duration_months ?? row.warrantyDurationMonths ?? 12),
  serviceDate: row.service_date || row.serviceDate || null,
  notes: row.notes || '',
});

// Converts frontend camelCase model to database snake_case columns
const denormalize = (item) => ({
  product_name: item.productName,
  purchase_date: item.purchaseDate,
  warranty_duration_months: Number(item.warrantyDurationMonths),
  service_date: item.serviceDate || null,
  notes: item.notes || '',
});

const mock = {
  list: async () => read(),
  get: async (id) => read().find((p) => p.id === Number(id)) || Promise.reject(notFound()),
  create: async (data) => {
    const list = read();
    const item = { ...data, id: Math.max(0, ...list.map((p) => p.id)) + 1 };
    write([...list, item]);
    return item;
  },
  update: async (id, data) => {
    const list = read();
    if (!list.some((p) => p.id === Number(id))) throw notFound();
    const item = { ...data, id: Number(id) };
    write(list.map((p) => (p.id === item.id ? item : p)));
    return item;
  },
  remove: async (id) => write(read().filter((p) => p.id !== Number(id))),
};

// ---------- The five operations (Supabase -> Spring Boot -> Mock fallback) ----------
export const getProducts = async () => {
  if (isMockMode) return mock.list();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (!error && data) return data.map(normalize);
    } catch {}
  }
  try {
    return (await client.get('/products')).data;
  } catch (e) {
    return mock.list();
  }
};

export const getProduct = async (id) => {
  if (isMockMode) return mock.get(id);
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) return normalize(data);
    } catch {}
  }
  try {
    return (await client.get(`/products/${id}`)).data;
  } catch (e) {
    return mock.get(id);
  }
};

export const createProduct = async (data) => {
  if (isMockMode) return mock.create(data);
  if (isSupabaseConfigured) {
    try {
      const { data: created, error } = await supabase.from('products').insert([denormalize(data)]).select().single();
      if (!error && created) return normalize(created);
    } catch {}
  }
  try {
    return (await client.post('/products', data)).data;
  } catch (e) {
    return mock.create(data);
  }
};

export const updateProduct = async (id, data) => {
  if (isMockMode) return mock.update(id, data);
  if (isSupabaseConfigured) {
    try {
      const { data: updated, error } = await supabase.from('products').update(denormalize(data)).eq('id', id).select().single();
      if (!error && updated) return normalize(updated);
    } catch {}
  }
  try {
    return (await client.put(`/products/${id}`, data)).data;
  } catch (e) {
    return mock.update(id, data);
  }
};

export const deleteProduct = async (id) => {
  if (isMockMode) return mock.remove(id);
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    } catch {}
  }
  try {
    return (await client.delete(`/products/${id}`)).data;
  } catch (e) {
    return mock.remove(id);
  }
};
