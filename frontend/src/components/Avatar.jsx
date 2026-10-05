import { initials } from '../utils';

const HUES = [158, 200, 28, 340, 262, 92];

export default function Avatar({ name, id = 0, size = 56 }) {
  const hue = HUES[Number(id) % HUES.length];
  return (
    <div
      className="avatar"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `hsl(${hue} 42% 90%)`,
        color: `hsl(${hue} 55% 22%)`,
      }}
    >
      {initials(name)}
    </div>
  );
}
