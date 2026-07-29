import { useEffect, useRef, useState } from 'react';
import './CountdownRing.css';

/**
 * CountdownRing — the large, live-ticking version of TimeRing used on
 * the Claim & Hold screen (US-6). Manages its own interval and calls
 * onExpire once the 15-minute hold runs out.
 *
 * Sped up for demo purposes: 15 real seconds represent the 15-minute hold.
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
          if (onExpire) onExpire();
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
    <div className="countdown-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="countdown-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className="countdown-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="countdown-ring-label">
        <div className="countdown-ring-time">
          {mm}:{ss}
        </div>
        <div className="countdown-ring-sub">to reach the vendor</div>
      </div>
    </div>
  );
}
