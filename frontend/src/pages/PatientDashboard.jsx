import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import AppointmentCard from '../components/AppointmentCard';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { docName } from '../utils';

export default function PatientDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/patient/appointments');
      setItems(data.appointments);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment? The slot will be given back to other patients.')) return;
    setBusyId(id);
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled.');
      await load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusyId(null);
    }
  };

  const upcoming = items.filter((a) => a.status === 'booked');
  const history = items.filter((a) => a.status !== 'booked').reverse();

  const render = (a, canCancel) => (
    <AppointmentCard
      key={a.id}
      appt={a}
      title={docName(a.doctor.name)}
      subtitle={[a.doctor.doctor_profile?.specialization, a.doctor.doctor_profile?.clinic_address].filter(Boolean).join(', ')}
    >
      {canCancel && (
        <button className="btn btn-danger-ghost btn-sm" disabled={busyId === a.id} onClick={() => cancel(a.id)}>
          {busyId === a.id ? 'Cancelling...' : 'Cancel'}
        </button>
      )}
    </AppointmentCard>
  );

  return (
    <div className="page">
      <div className="container narrow">
        <header className="page-head row">
          <div>
            <h1>Hello, {user.name.split(' ')[0]}</h1>
            <p>Your booked visits and past appointments.</p>
          </div>
          <Link to="/doctors" className="btn btn-primary">Book a new visit</Link>
        </header>

        {loading ? (
          <Spinner label="Loading your appointments" />
        ) : (
          <>
            <h2 className="list-title">Upcoming ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <EmptyState title="No upcoming appointments" text="Pick a doctor and choose a free slot to get started.">
                <Link to="/doctors" className="btn btn-primary btn-sm">Find a doctor</Link>
              </EmptyState>
            ) : (
              <div className="stack">{upcoming.map((a) => render(a, true))}</div>
            )}

            {history.length > 0 && (
              <>
                <h2 className="list-title">History</h2>
                <div className="stack">{history.map((a) => render(a, false))}</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
