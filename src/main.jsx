import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/products.css';
import './styles/forms.css';
import './styles/auth.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
