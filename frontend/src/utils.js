export const SPECIALIZATIONS = [
  'Cardiologist', 'Dermatologist', 'Pediatrician', 'Dentist', 'Gynecologist',
  'Orthopedic Surgeon', 'General Physician', 'Neurologist', 'ENT Specialist',
  'Eye Specialist', 'Psychiatrist', 'Urologist',
];

export const parseDate = (d) => new Date(`${d}T00:00:00`);

export const fmtDay = (d) =>
  parseDate(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export const fmtDayLong = (d) =>
  parseDate(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const fmtTime = (t = '') => {
  const [h, m] = t.split(':');
  const hour = Number(h);
  return `${((hour + 11) % 12) + 1}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const relativeDay = (d) => {
  const diff = Math.round((parseDate(d) - parseDate(todayStr())) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return fmtDay(d).split(' ')[0];
};

export const initials = (name = '') =>
  name.replace(/^Dr\.?\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export const docName = (name = '') => (/^dr\.?\s/i.test(name) ? name : `Dr. ${name}`);

export const money = (n) => (n ? `Rs. ${Number(n).toLocaleString('en-PK')}` : 'Fee on visit');

export const groupBy = (arr, fn) =>
  arr.reduce((acc, item) => {
    const key = fn(item);
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});

export const lines = (text = '') => text.split('\n').map((l) => l.trim()).filter(Boolean);
