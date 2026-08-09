import logoFull from '../../assets/logo-full.png';
import logoCompact from '../../assets/logo-compact.png';

/**
 * Logo — real FoodShare wordmark assets (finally provided as actual
 * files, replacing the earlier text-based placeholder). `withTagline`
 * uses the full lockup (includes "SURPLUS FOOD MARKETPLACE"); without
 * it, the compact mark is used instead — matches the two variants
 * provided ("name_logo size mobile/desktop").
 */
const HEIGHTS = { sm: 'h-6', md: 'h-8', lg: 'h-10' };

export default function Logo({ size = 'md', withTagline = false, className = '' }) {
  const src = withTagline ? logoFull : logoCompact;
  const heightClass = HEIGHTS[size] || HEIGHTS.md;
  return (
    <img
      src={src}
      alt="FoodShare — Surplus Food Marketplace"
      className={['w-auto', heightClass, className].filter(Boolean).join(' ')}
    />
  );
}
