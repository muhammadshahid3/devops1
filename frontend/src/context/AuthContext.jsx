import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = ({ user, token }) => {
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const login = async (email, password) =>
    saveSession((await api.post('/login', { email, password })).data);

  const register = async (payload) =>
    saveSession((await api.post('/register', payload)).data);

  const logout = async () => {
    try { await api.post('/logout'); } catch { /* token may already be gone */ }
    localStorage.removeItem('token');
    setUser(null);
  };

  const refresh = async () => setUser((await api.get('/me')).data.user);

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}
