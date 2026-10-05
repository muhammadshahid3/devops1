import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turns any API error into one readable sentence
export function errMsg(error) {
  const data = error?.response?.data;
  if (data?.errors) return Object.values(data.errors)[0][0];
  if (data?.message) return data.message;
  if (error?.code === 'ERR_NETWORK') return 'Cannot reach the server. Check that the backend is running.';
  return 'Something went wrong. Please try again.';
}

export default api;
