import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="state-box">
      <p className="big-404">404</p>
      <h2>Page not found</h2>
      <p>This page doesn’t exist or has moved.</p>
      <Link to="/" className="btn btn-primary">Back to dashboard</Link>
    </div>
  );
}
