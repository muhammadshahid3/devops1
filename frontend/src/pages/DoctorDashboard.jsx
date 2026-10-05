import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarPlus, X } from 'lucide-react';
import api, { errMsg } from '../api';
import AppointmentCard from '../components/AppointmentCard';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SPECIALIZATIONS, docName, fmtDayLong, fmtTime, groupBy, todayStr } from '../utils';

const TABS = [
  { id: 'appointments', label: 'Appointments' },
  { id: 'slots', label: 'My slots' },
  { id: 'profile', label: 'Profile and education' },
];

/* ---------------------------------------------------------------- */
/* Appointments tab                                                  */
/* ---------------------------------------------------------------- */
function AppointmentsTab({ appointments, reload }) {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const [view, setView] = useState('upcoming');

  const update = async (id, status) => {
    const text = status === 'cancelled'
      ? 'Cancel this appointment? The slot will open up again for other patients.'
      : 'Mark this appointment as completed?';
    if (!window.confirm(text)) return;
    setBusyId(id);
    try {
      await api.patch(`/doctor/appointments/${id}`, { status });
      toast.success(status === 'completed' ? 'Marked as completed.' : 'Appointment cancelled.');
      await reload();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusyId(null);
    }
  };

  const upcoming = appointments.filter((a) => a.status === 'booked');
  const history = appointments.filter((a) => a.status !== 'booked').reverse();
  const list = view === 'upcoming' ? upcoming : history;

  return (
    <>
      <div className="segmented small" role="tablist">
        <button className={view === 'upcoming' ? 'active' : ''} onClick={() => setView('upcoming')}>Upcoming ({upcoming.length})</button>
        <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>History ({history.length})</button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={view === 'upcoming' ? 'No bookings yet' : 'Nothing in history yet'}
          text={view === 'upcoming' ? 'Open some slots in "My slots" so patients can book you.' : 'Completed and cancelled visits appear here.'}
        />
      ) : (
        <div className="stack">
          {list.map((a) => (
            <AppointmentCard
              key={a.id}
              appt={a}
              title={a.patient.name}
              subtitle={[a.patient.phone, a.patient.email].filter(Boolean).join(', ')}
            >
              {a.status === 'booked' && (
                <>
                  <button className="btn btn-primary btn-sm" disabled={busyId === a.id} onClick={() => update(a.id, 'completed')}>Mark completed</button>
                  <button className="btn btn-danger-ghost btn-sm" disabled={busyId === a.id} onClick={() => update(a.id, 'cancelled')}>Cancel</button>
                </>
              )}
            </AppointmentCard>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Slots tab                                                         */
/* ---------------------------------------------------------------- */
function SlotsTab({ slots, reload }) {
  const toast = useToast();
  const [form, setForm] = useState({ date: todayStr(), start_time: '10:00', end_time: '13:00', duration: 30 });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const preview = useMemo(() => {
    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const span = toMin(form.end_time) - toMin(form.start_time);
    return span > 0 ? Math.floor(span / Number(form.duration)) : 0;
  }, [form]);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/doctor/slots', { ...form, duration: Number(form.duration) });
      toast.success(data.message);
      await reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/doctor/slots/${id}`);
      await reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const byDate = groupBy(slots, (s) => s.date);
  const dates = Object.keys(byDate).sort();

  return (
    <div className="two-col">
      <form className="card form" onSubmit={add}>
        <h2 className="card-title"><CalendarPlus size={20} /> Open new slots</h2>
        <p className="muted small">Choose your working hours for a day and we cut them into bookable slots.</p>

        <label className="field">
          <span>Date</span>
          <input type="date" required min={todayStr()} value={form.date} onChange={set('date')} />
        </label>
        <div className="field-row">
          <label className="field">
            <span>From</span>
            <input type="time" required value={form.start_time} onChange={set('start_time')} />
          </label>
          <label className="field">
            <span>Until</span>
            <input type="time" required value={form.end_time} onChange={set('end_time')} />
          </label>
        </div>
        <label className="field">
          <span>Minutes per patient</span>
          <select value={form.duration} onChange={set('duration')}>
            {[10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}
          </select>
        </label>

        <p className="preview">{preview > 0 ? `This creates up to ${preview} slots.` : 'End time must be after the start time.'}</p>

        <button className="btn btn-primary btn-block" disabled={busy || preview < 1}>
          {busy ? 'Adding...' : 'Add slots'}
        </button>
      </form>

      <div>
        <h2 className="list-title first">Your upcoming slots</h2>
        {dates.length === 0 ? (
          <EmptyState title="No slots yet" text="Add your first working day on the left. Patients can book as soon as slots exist." />
        ) : (
          <div className="stack">
            {dates.map((d) => (
              <section key={d} className="card day-card">
                <h3>{fmtDayLong(d)}</h3>
                <div className="slot-grid">
                  {byDate[d].map((s) =>
                    s.is_booked ? (
                      <span key={s.id} className="slot-tag taken" title="Booked">
                        {fmtTime(s.start_time)}
                        <small>{s.appointment?.patient?.name || 'Booked'}</small>
                      </span>
                    ) : (
                      <span key={s.id} className="slot-tag free">
                        {fmtTime(s.start_time)}
                        <button onClick={() => remove(s.id)} aria-label={`Remove ${fmtTime(s.start_time)} slot`}><X size={14} /></button>
                      </span>
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Profile tab                                                       */
/* ---------------------------------------------------------------- */
function ProfileTab() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const p = user.doctor_profile || {};

  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    specialization: p.specialization || 'General Physician',
    education: p.education || '',
    experience_years: p.experience_years ?? '',
    fee: p.fee ?? '',
    city: p.city || '',
    clinic_address: p.clinic_address || '',
    bio: p.bio || '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/doctor/profile', form);
      await refresh();
      toast.success('Profile saved. Patients now see your latest details.');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const specs = SPECIALIZATIONS.includes(form.specialization) ? SPECIALIZATIONS : [form.specialization, ...SPECIALIZATIONS];

  return (
    <form className="card form profile-form" onSubmit={save}>
      <h2 className="card-title">What patients see on your page</h2>

      <div className="field-row">
        <label className="field">
          <span>Full name</span>
          <input required value={form.name} onChange={set('name')} />
        </label>
        <label className="field">
          <span>Phone</span>
          <input value={form.phone} onChange={set('phone')} />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Specialty</span>
          <select value={form.specialization} onChange={set('specialization')}>
            {specs.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Years of experience</span>
          <input type="number" min="0" max="70" value={form.experience_years} onChange={set('experience_years')} />
        </label>
      </div>

      <label className="field">
        <span>Education and qualifications (one per line)</span>
        <textarea
          rows={5}
          value={form.education}
          onChange={set('education')}
          placeholder={'MBBS - King Edward Medical University\nFCPS Cardiology - CPSP'}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Consultation fee (Rs.)</span>
          <input type="number" min="0" value={form.fee} onChange={set('fee')} />
        </label>
        <label className="field">
          <span>City</span>
          <input value={form.city} onChange={set('city')} />
        </label>
      </div>

      <label className="field">
        <span>Clinic address</span>
        <input value={form.clinic_address} onChange={set('clinic_address')} />
      </label>

      <label className="field">
        <span>About you</span>
        <textarea rows={4} value={form.bio} onChange={set('bio')} placeholder="What do you treat? How do you work with patients?" />
      </label>

      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save profile'}</button>
    </form>
  );
}

/* ---------------------------------------------------------------- */
/* Page                                                              */
/* ---------------------------------------------------------------- */
export default function DoctorDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'appointments';

  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([api.get('/doctor/appointments'), api.get('/doctor/slots')]);
      setAppointments(a.data.appointments);
      setSlots(s.data.slots);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { reload(); }, [reload]);

  const stats = {
    upcoming: appointments.filter((a) => a.status === 'booked').length,
    open: slots.filter((s) => !s.is_booked).length,
    done: appointments.filter((a) => a.status === 'completed').length,
  };

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <h1>{docName(user.name)}</h1>
          <p>{user.doctor_profile?.specialization}. Manage your slots, bookings and public profile.</p>
        </header>

        <div className="stats">
          <div className="stat"><strong>{stats.upcoming}</strong><span>Upcoming bookings</span></div>
          <div className="stat"><strong>{stats.open}</strong><span>Open slots</span></div>
          <div className="stat"><strong>{stats.done}</strong><span>Completed visits</span></div>
        </div>

        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? 'active' : ''}
              onClick={() => setParams({ tab: t.id })}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner label="Loading your clinic" />
        ) : tab === 'appointments' ? (
          <AppointmentsTab appointments={appointments} reload={reload} />
        ) : tab === 'slots' ? (
          <SlotsTab slots={slots} reload={reload} />
        ) : (
          <ProfileTab />
        )}
      </div>
    </div>
  );
}
