const TONES = {
  accent: 'bg-accent-orange-light text-accent-orange-dark',
  secondary: 'bg-accent-green-light text-accent-green-dark',
  neutral: 'bg-secondary-light text-ink',
};
export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={['inline-flex items-center rounded-full px-2.5 py-1 text-caption font-bold', TONES[tone] || TONES.neutral, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}
