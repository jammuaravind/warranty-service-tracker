import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import { isMockMode, toggleMockMode } from '../services/api.js';

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setMenuOpen(false), [pathname]); // close the mobile menu after navigating

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main">
        <Navbar onMenu={() => setMenuOpen(true)} />
        {isMockMode && (
          <div className="mock-banner" role="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>Demo mode: products are stored in your browser. Nothing is saved to MySQL.</span>
            {typeof window !== 'undefined' && localStorage.getItem('wst-demo-mode') === 'true' && (
              <button
                type="button"
                className="btn"
                style={{ padding: '4px 10px', fontSize: '12px', background: '#fff' }}
                onClick={() => toggleMockMode(false)}
              >
                Exit Demo Mode
              </button>
            )}
          </div>
        )}
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
