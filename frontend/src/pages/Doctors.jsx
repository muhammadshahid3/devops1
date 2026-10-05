import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../api';
import DoctorCard from '../components/DoctorCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

export default function Doctors() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const specialization = params.get('specialization') || '';

  const [input, setInput] = useState(q);
  const [doctors, setDoctors] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/specializations').then((r) => setSpecs(r.data.specializations)).catch(() => {});
  }, []);

  // wait a moment after typing before searching
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      input ? next.set('q', input) : next.delete('q');
      setParams(next, { replace: true });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  useEffect(() => {
    setLoading(true);
    api.get('/doctors', { params: { q, specialization } })
      .then((r) => setDoctors(r.data.doctors))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, [q, specialization]);

  const setSpec = (value) => {
    const next = new URLSearchParams(params);
    value ? next.set('specialization', value) : next.delete('specialization');
    setParams(next, { replace: true });
  };

  const clear = () => { setInput(''); setParams({}, { replace: true }); };

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <h1>Find a doctor</h1>
          <p>Choose a specialty, compare education and experience, then book an open slot.</p>
        </header>

        <div className="filters">
          <div className="search-box">
            <Search size={18} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Doctor name, specialty or city"
              aria-label="Search doctors"
            />
          </div>
          <select value={specialization} onChange={(e) => setSpec(e.target.value)} aria-label="Specialty">
            <option value="">All specialties</option>
            {specs.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <Spinner label="Finding doctors" />
        ) : doctors.length === 0 ? (
          <EmptyState title="No doctors match your search" text="Try a different name or choose all specialties.">
            <button className="btn btn-primary btn-sm" onClick={clear}>Clear filters</button>
          </EmptyState>
        ) : (
          <>
            <p className="result-count">{doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} found</p>
            <div className="doc-grid">
              {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
