import { Clock } from 'lucide-react';
import { fmtDayLong, fmtTime, parseDate } from '../utils';

const LABEL = { booked: 'Booked', completed: 'Completed', cancelled: 'Cancelled' };

export default function AppointmentCard({ appt, title, subtitle, children }) {
  const d = parseDate(appt.slot.date);

  return (
    <article className={`appt appt-${appt.status}`}>
      <div className="appt-date">
        <span className="appt-day">{d.getDate()}</span>
        <span className="appt-mon">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
      </div>

      <div className="appt-body">
        <div className="appt-top">
          <h3>{title}</h3>
          <span className={`badge badge-${appt.status}`}>{LABEL[appt.status]}</span>
        </div>
        {subtitle && <p className="appt-sub">{subtitle}</p>}
        <p className="appt-time">
          <Clock size={15} /> {fmtDayLong(appt.slot.date)}, {fmtTime(appt.slot.start_time)} to {fmtTime(appt.slot.end_time)}
        </p>
        {appt.reason && <p className="appt-reason">Reason: {appt.reason}</p>}
      </div>

      {children && <div className="appt-actions">{children}</div>}
    </article>
  );
}
