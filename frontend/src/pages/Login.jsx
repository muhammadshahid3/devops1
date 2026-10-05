import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../api';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      navigate(location.state?.from || (user.role === 'doctor' ? '/doctor' : '/patient'), { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const demo = (email) => setForm({ email, password: 'password' });

  return (
    <AuthLayout title="Log in" subtitle="Use your patient or doctor account.">
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Email</span>
          <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" required autoComplete="current-password" value={form.password} onChange={set('password')} />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
      </form>

      <div className="demo-box">
        <p>Try the demo accounts (password is <code>password</code>)</p>
        <div className="demo-btns">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => demo('patient@demo.test')}>Demo patient</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => demo('ayesha@doctor.test')}>Demo doctor</button>
        </div>
      </div>

      <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
    </AuthLayout>
  );
}
