import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Award, GraduationCap, MapPin, Briefcase, Banknote } from 'lucide-react';
import api, { errMsg } from '../api';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { docName, fmtDay, fmtDayLong, fmtTime, groupBy, lines, money, parseDate, relativeDay } from '../utils';

export default function DoctorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/doctors/${id}`);
      setDoctor(data.doctor);
      setSlots(data.slots);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const byDate = useMemo(() => groupBy(slots, (s) => s.date), [slots]);
  const dates = Object.keys(byDate).sort();

  // open the first day that still has a free slot
  useEffect(() => {
    if (!dates.length) return;
    if (!date || !byDate[date]) {
      setDate(dates.find((d) => byDate[d].some((s) => !s.is_booked)) || dates[0]);
    }
  }, [dates.join(','), slots]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Spinner label="Loading doctor profile" />;
  if (notFound || !doctor) {
    return (
      <div className="page"><div className="container">
        <EmptyState title="Doctor not found" text="This profile may have been removed.">
          <Link className="btn btn-primary btn-sm" to="/doctors">Back to all doctors</Link>
        </EmptyState>
      </div></div>
    );
  }

  const p = doctor.doctor_profile || {};
  const chosen = slots.find((s) => s.id === slot);

  const confirm = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setBooking(true);
    try {
      await api.post('/appointments', { slot_id: slot, reason: reason || null });
      toast.success('Appointment booked. You can see it on your dashboard.');
      navigate('/patient');
    } catch (e) {
      toast.error(errMsg(e));
      setSlot(null);
      load(); // refresh: someone may have taken the slot
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="page">
      <div className="container detail-grid">
        {/* ---------- Profile ---------- */}
        <div className="detail-main">
          <section className="card profile-head">
            <Avatar name={doctor.name} id={doctor.id} size={96} />
            <div>
              <h1>{docName(doctor.name)}</h1>
              <p className="doc-spec lg">{p.specialization}</p>
              <ul className="facts">
                {p.experience_years != null && <li><Briefcase size={16} /> {p.experience_years} years experience</li>}
                {p.city && <li><MapPin size={16} /> {p.city}</li>}
                <li><Banknote size={16} /> {money(p.fee)} per visit</li>
              </ul>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title"><GraduationCap size={20} /> Education and qualifications</h2>
            {lines(p.education).length ? (
              <ul className="edu-list">
                {lines(p.education).map((l, i) => <li key={i}><Award size={16} /> {l}</li>)}
              </ul>
            ) : (
              <p className="muted">This doctor has not added their education yet.</p>
            )}
          </section>

          {(p.bio || p.clinic_address) && (
            <section className="card">
              <h2 className="card-title">About the doctor</h2>
              {p.bio && <p className="prose">{p.bio}</p>}
              {p.clinic_address && <p className="clinic"><MapPin size={16} /> {p.clinic_address}</p>}
            </section>
          )}
        </div>

        {/* ---------- Booking ---------- */}
        <aside className="detail-side">
          <div className="ticket book-card">
            <h2>Book an appointment</h2>

            {user?.role === 'doctor' ? (
              <p className="notice">Doctor accounts cannot book visits. Log in with a patient account to book.</p>
            ) : dates.length === 0 ? (
              <p className="muted">This doctor has no upcoming slots yet. Check again soon.</p>
            ) : (
              <>
                <div className="date-tabs" role="tablist" aria-label="Choose a day">
                  {dates.map((d) => {
                    const free = byDate[d].filter((s) => !s.is_booked).length;
                    const dt = parseDate(d);
                    return (
                      <button
                        key={d}
                        role="tab"
                        aria-selected={date === d}
                        className={`date-tab ${date === d ? 'active' : ''} ${free === 0 ? 'full' : ''}`}
                        onClick={() => { setDate(d); setSlot(null); }}
                      >
                        <span>{relativeDay(d)}</span>
                        <strong>{dt.getDate()}</strong>
                        <small>{dt.toLocaleDateString('en-GB', { month: 'short' })}</small>
                      </button>
                    );
                  })}
                </div>

                <p className="ticket-day">{date && fmtDayLong(date)}</p>
                <div className="slot-grid">
                  {(byDate[date] || []).map((s) => (
                    <button
                      key={s.id}
                      className={`slot ${slot === s.id ? 'selected' : ''} ${s.is_booked ? 'booked' : ''}`}
                      disabled={s.is_booked}
                      onClick={() => setSlot(s.id)}
                      title={s.is_booked ? 'Already booked' : 'Select this time'}
                    >
                      {fmtTime(s.start_time)}
                    </button>
                  ))}
                </div>

                <div className="ticket-divider" />

                {chosen ? (
                  <div className="summary">
                    <span className="ticket-label">Your appointment</span>
                    <strong>{fmtDay(chosen.date)}, {fmtTime(chosen.start_time)} to {fmtTime(chosen.end_time)}</strong>
                  </div>
                ) : (
                  <p className="muted small">Select a time to continue.</p>
                )}

                {chosen && user?.role === 'patient' && (
                  <label className="field">
                    <span>Reason for visit (optional)</span>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="For example: chest pain when climbing stairs"
                    />
                  </label>
                )}

                <button className="btn btn-accent btn-block" disabled={!chosen || booking} onClick={confirm}>
                  {booking ? 'Booking...' : user ? 'Confirm booking' : 'Log in to book'}
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
