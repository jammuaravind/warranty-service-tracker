import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiShield, FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useToast();

  const destination = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const u = await login(email, password);
        notify(`Welcome back, ${u.name}!`);
      } else {
        const u = await register(name, email, password);
        notify(`Account created. Welcome, ${u.name}!`);
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const u = await login('student@example.com', 'password123');
      notify(`Signed in as demo user (${u.name})`);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiShield />
          </div>
          <h1>Warranty &amp; Service Tracker</h1>
          <p>{mode === 'signin' ? 'Sign in to access your products and warranties' : 'Create an account to start tracking warranties'}</p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); }}
            role="tab"
            aria-selected={mode === 'signin'}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
            role="tab"
            aria-selected={mode === 'register'}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="auth-name">Full Name *</label>
              <div className="input-with-icon">
                <FiUser className="field-icon" aria-hidden="true" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="auth-email">Email Address *</label>
            <div className="input-with-icon">
              <FiMail className="field-icon" aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={mode === 'signin'}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="auth-password">Password *</label>
            <div className="input-with-icon">
              <FiLock className="field-icon" aria-hidden="true" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn-submit"
            disabled={loading}
          >
            {loading ? (
              'Processing…'
            ) : mode === 'signin' ? (
              <>Sign In <FiArrowRight /></>
            ) : (
              <>Create Account <FiCheck /></>
            )}
          </button>
        </form>

        <div className="demo-login-box">
          <p className="muted small" style={{ marginBottom: '10px' }}>
            Want to test quickly without typing?
          </p>
          <button
            type="button"
            className="demo-login-btn"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <FiUser /> Sign In with Demo Account
          </button>
        </div>
      </div>
    </div>
  );
}
