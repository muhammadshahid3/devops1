import { CalendarCheck, GraduationCap, UserRound } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <h2>One place for patients and doctors.</h2>
        <ul>
          <li><UserRound size={20} /><span><strong>Patients</strong> browse doctors and book a free slot.</span></li>
          <li><GraduationCap size={20} /><span><strong>Doctors</strong> share their education and clinic details.</span></li>
          <li><CalendarCheck size={20} /><span>Doctors open slots, patients take them, nobody double books.</span></li>
        </ul>
      </aside>

      <section className="auth-form">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}
