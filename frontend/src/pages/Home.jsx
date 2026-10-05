import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../api';
import Avatar from '../components/Avatar';
import DoctorCard from '../components/DoctorCard';

const SPECIALTIES = ['Cardiologist', 'Dermatologist', 'Pediatrician', 'Dentist', 'Gynecologist', 'Orthopedic Surgeon'];
const SAMPLE_TIMES = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM'];

function HeroTicket() {
  const [picked, setPicked] = useState('10:30 AM');

  return (
    <div className="ticket hero-ticket" aria-label="Example booking card">
      <div className="ticket-top">
        <Avatar name="Ayesha Khan" id={0} size={52} />
        <div>
          <h3>Dr. Ayesha Khan</h3>
          <p className="doc-spec">Cardiologist, FCPS</p>
        </div>
      </div>

      <p className="ticket-day">Tomorrow, pick a time</p>
      <div className="slot-grid">
        {SAMPLE_TIMES.map((t) => (
          <button
            key={t}
            type="button"
            className={`slot ${picked === t ? 'selected' : ''} ${t === '11:30 AM' ? 'booked' : ''}`}
            disabled={t === '11:30 AM'}
            onClick={() => setPicked(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="ticket-divider" />
      <div className="ticket-bottom">
        <div>
          <span className="ticket-label">Your slot</span>
          <strong>{picked}</strong>
        </div>
        <Link to="/doctors" className="btn btn-accent btn-sm">Find your doctor</Link>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/doctors').then((r) => setFeatured(r.data.doctors.slice(0, 3))).catch(() => {});
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(q ? `/doctors?q=${encodeURIComponent(q)}` : '/doctors');
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>See the right doctor at a time that suits you.</h1>
            <p className="hero-sub">
              Read each doctor's education and experience, see which slots are free, and book in under a minute.
            </p>

            <form className="hero-search" onSubmit={search}>
              <Search size={20} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a doctor, specialty or city"
                aria-label="Search doctors"
              />
              <button className="btn btn-accent" type="submit">Search</button>
            </form>

            <div className="chip-row">
              {SPECIALTIES.map((s) => (
                <Link key={s} to={`/doctors?specialization=${encodeURIComponent(s)}`} className="chip">{s}</Link>
              ))}
            </div>
          </div>

          <HeroTicket />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">How booking works</h2>
          <div className="steps">
            <div className="step">
              <span className="step-no">1</span>
              <h3>Find a doctor</h3>
              <p>Search by name, specialty or city. Every profile lists degrees, years of experience and the clinic address.</p>
            </div>
            <div className="step">
              <span className="step-no">2</span>
              <h3>Pick a free slot</h3>
              <p>Open times are shown day by day. Slots that someone already took are crossed out, so you never double book.</p>
            </div>
            <div className="step">
              <span className="step-no">3</span>
              <h3>Visit and manage</h3>
              <p>Your booking sits on your dashboard. Cancel from there and the slot goes back to other patients.</p>
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section section-tight">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">Doctors taking bookings now</h2>
              <Link to="/doctors" className="link">See all doctors</Link>
            </div>
            <div className="doc-grid">
              {featured.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Are you a doctor?</h2>
              <p>Add your education, set your clinic hours and let patients book the slots you open. You see every booking in one list.</p>
            </div>
            <Link to="/register?role=doctor" className="btn btn-accent">Create a doctor account</Link>
          </div>
        </div>
      </section>
    </>
  );
}
