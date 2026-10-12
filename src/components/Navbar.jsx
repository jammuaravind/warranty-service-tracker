import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiMenu, FiSearch, FiUser, FiLogOut, FiLogIn, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';

function titleFor(path) {
  if (path === '/') return 'Dashboard';
  if (path === '/products') return 'Products';
  if (path === '/products/new') return 'Add Product';
  if (path.endsWith('/edit')) return 'Edit Product';
  if (path.startsWith('/products/')) return 'Product Details';
  return 'Not Found';
}

export default function Navbar({ onMenu }) {
  const [q, setQ] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const notify = useToast();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Searching from the top bar opens the Products page with the search text
  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    notify('You have been signed out.');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="navbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu"><FiMenu /></button>
      <h1 className="page-title">{titleFor(pathname)}</h1>
      <form className="search" onSubmit={submit} role="search">
        <FiSearch aria-hidden="true" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" />
      </form>

      {isAuthenticated ? (
        <div className="profile-menu-container" ref={dropdownRef}>
          <button
            type="button"
            className={`profile-button ${dropdownOpen ? 'active' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-label="User account menu"
          >
            <span className="profile-avatar-circle">{initials}</span>
            <span>{user?.name || 'Account'}</span>
            <FiChevronDown style={{ fontSize: '13px', opacity: 0.7 }} />
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-name">{user?.name}</div>
                <div className="profile-dropdown-email">{user?.email}</div>
              </div>
              <button
                type="button"
                className="profile-dropdown-item danger"
                onClick={handleLogout}
              >
                <FiLogOut /> Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }}>
          <FiLogIn /> Sign In
        </Link>
      )}
    </header>
  );
}
