import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { errorMessage } from '../api.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <form className="form narrow" onSubmit={submit}>
      <h1>Create your account</h1>
      {error && <p className="alert">{error}</p>}
      <label>
        Name
        <input value={form.name} onChange={set('name')} required maxLength={60} autoFocus />
      </label>
      <label>
        Email
        <input type="email" value={form.email} onChange={set('email')} required />
      </label>
      <label>
        Password <small className="muted">(min 6 characters)</small>
        <input type="password" value={form.password} onChange={set('password')} required minLength={6} />
      </label>
      <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      <p className="muted">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}
