/**
 * Badge — small status/label pill. Distinct from `Chip`: Badge is a
 * static, non-interactive indicator (e.g. "Live", "Verified"); Chip is
 * always a clickable control (filter, removable tag).
 */
const TONES = {
  accent: 'bg-accent-orange-light text-accent-orange-dark',
  secondary: 'bg-accent-green-light text-accent-green-dark',
  neutral: 'bg-secondary-light text-ink',
};

export default function Badge({ children, tone = 'neutral', className = '' }) {
  const toneClasses = TONES[tone] || TONES.neutral;
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-caption font-bold',
        toneClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
