import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../api';
import { SPECIALIZATIONS } from '../utils';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [role, setRole] = useState(params.get('role') === 'doctor' ? 'doctor' : 'patient');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', specialization: 'General Physician', education: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { ...form, role };
      if (role === 'patient') { delete payload.specialization; delete payload.education; }
      const user = await register(payload);
      toast.success('Account created. Welcome to DocSlot.');
      navigate(user.role === 'doctor' ? '/doctor?tab=slots' : '/patient', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Choose how you will use DocSlot.">
      <div className="segmented" role="tablist" aria-label="Account type">
        {['patient', 'doctor'].map((r) => (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={role === r}
            className={role === r ? 'active' : ''}
            onClick={() => setRole(r)}
          >
            {r === 'patient' ? 'I am a patient' : 'I am a doctor'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Full name</span>
          <input required value={form.name} onChange={set('name')} autoComplete="name" />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Email</span>
            <input type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
          </label>
          <label className="field">
            <span>Phone</span>
            <input value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="03xx-xxxxxxx" />
          </label>
        </div>

        <label className="field">
          <span>Password (at least 6 characters)</span>
          <input type="password" required minLength={6} value={form.password} onChange={set('password')} autoComplete="new-password" />
        </label>

        {role === 'doctor' && (
          <>
            <label className="field">
              <span>Specialty</span>
              <select value={form.specialization} onChange={set('specialization')}>
                {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Education (one degree per line)</span>
              <textarea
                rows={4}
                value={form.education}
                onChange={set('education')}
                placeholder={'MBBS - King Edward Medical University\nFCPS Cardiology'}
              />
            </label>
          </>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
    </AuthLayout>
  );
}
