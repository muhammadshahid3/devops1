import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const home = user ? (user.role === 'doctor' ? '/doctor' : '/patient') : '/login';

  const handleLogout = async () => {
    await logout();
    close();
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo />

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/doctors" onClick={close}>Find doctors</NavLink>
          {user && <NavLink to={home} onClick={close}>{user.role === 'doctor' ? 'My clinic' : 'My appointments'}</NavLink>}

          <div className="nav-actions">
            {user ? (
              <>
                <span className="nav-user">{user.name}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>Log in</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Sign up</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
