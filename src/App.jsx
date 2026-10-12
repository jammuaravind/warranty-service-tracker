import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import AddProduct from './pages/AddProduct.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import EditProduct from './pages/EditProduct.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<AddProduct />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/products/:id/edit" element={<EditProduct />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
