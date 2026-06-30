import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
      <div style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--purple)', textShadow: '0 0 40px rgba(139,92,246,0.5)', marginBottom: '16px', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.1rem' }}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
        Return Home
      </Link>
    </div>
  );
}
