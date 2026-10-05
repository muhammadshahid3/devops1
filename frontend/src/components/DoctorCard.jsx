import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Briefcase } from 'lucide-react';
import Avatar from './Avatar';
import { docName, lines, money } from '../utils';

export default function DoctorCard({ doctor }) {
  const p = doctor.doctor_profile || {};
  const firstDegree = lines(p.education)[0];
  const open = doctor.available_slots_count ?? 0;

  return (
    <article className="doc-card">
      <div className="doc-card-head">
        <Avatar name={doctor.name} id={doctor.id} size={60} />
        <div>
          <h3>{docName(doctor.name)}</h3>
          <p className="doc-spec">{p.specialization}</p>
        </div>
      </div>

      <ul className="doc-meta">
        {firstDegree && <li><GraduationCap size={16} /> {firstDegree}</li>}
        {p.experience_years != null && <li><Briefcase size={16} /> {p.experience_years} years experience</li>}
        {p.city && <li><MapPin size={16} /> {p.city}</li>}
      </ul>

      <div className="doc-card-foot">
        <div>
          <span className="doc-fee">{money(p.fee)}</span>
          <span className={`pill ${open ? 'pill-open' : 'pill-none'}`}>
            {open ? `${open} open slots` : 'No open slots'}
          </span>
        </div>
        <Link to={`/doctors/${doctor.id}`} className="btn btn-primary btn-sm">View and book</Link>
      </div>
    </article>
  );
}
