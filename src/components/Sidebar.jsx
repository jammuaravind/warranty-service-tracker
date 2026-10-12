import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiBox, FiPlusCircle, FiShield, FiX, FiLogOut, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: <FiGrid />, end: true },
  { to: '/products', label: 'Products', icon: <FiBox />, end: true },
  { to: '/products/new', label: 'Add Product', icon: <FiPlusCircle />, end: true },
];

export default function Sidebar({ open, onClose }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const notify = useToast();

  const handleLogout = () => {
    logout();
    onClose();
    notify('You have been signed out.');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      {open && <div className="overlay" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`} aria-label="Main navigation">
        <div className="logo">
          <span className="logo-mark"><FiShield /></span>
          <span>Warranty &amp; Service Tracker</span>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu"><FiX /></button>
        </div>
        <nav style={{ flex: 1 }}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.icon}<span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user-footer">
          {isAuthenticated ? (
            <>
              <div className="sidebar-user-info">
                <span className="profile-avatar-circle">{initials}</span>
                <div className="sidebar-user-text">
                  <div className="sidebar-user-name" title={user?.name}>{user?.name}</div>
                  <div className="sidebar-user-role">{user?.email || 'Logged in'}</div>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn danger"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="nav-link"
              style={{ width: '100%', marginBottom: 0 }}
            >
              <FiLogIn /><span>Sign In</span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
