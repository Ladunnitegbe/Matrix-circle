import { useEffect, useRef, useState } from 'react';

/**
 * CountdownRing — large ticking countdown ring, used on the post-claim
 * hold screen. `speedFactor` defaults to 60 (an old demo default —
 * see ReleaseClaimPage, which explicitly overrides it to 1 for real
 * 15-real-minutes behavior).
 */
export default function CountdownRing({ totalSeconds = 900, active = true, onExpire, speedFactor = 60 }) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - speedFactor;
        if (next <= 0) {
          clearInterval(intervalRef.current);
          onExpire?.();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const size = 210;
  const stroke = 12;
  const r = size / 2 - stroke / 2 - 1;
  const c = 2 * Math.PI * r;
  const pct = secondsLeft / totalSeconds;
  const offset = c * (1 - pct);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="relative mx-auto my-3" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className="stroke-secondary-light" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} className="stroke-accent-orange transition-[stroke-dashoffset] duration-1000 ease-linear" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-h4 font-semibold text-ink">{mm}:{ss}</span>
        <span className="mt-0.5 text-caption font-semibold text-ink-faint">to reach the vendor</span>
      </div>
    </div>
  );
}
