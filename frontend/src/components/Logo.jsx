import { Link } from 'react-router-dom';

export default function Logo({ light = false }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo-light' : ''}`} aria-label="DocSlot home">
      <span className="logo-mark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round">
          <path d="M12 4v16M4 12h16" />
        </svg>
      </span>
      <span className="logo-text">DocSlot</span>
    </Link>
  );
}
