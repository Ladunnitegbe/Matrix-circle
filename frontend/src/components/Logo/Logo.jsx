/**
 * Logo — FoodShare wordmark.
 *
 * PLACEHOLDER: the Figma logo export was PNG-only (a full lockup with
 * the "SURPLUS FOOD MARKETPLACE" tagline, plus a compact version) —
 * no SVG source, and no asset file has actually been added to this
 * project. A raster <img> would either be broken (no file exists) or
 * blurry at large sizes / high-DPI screens, so this renders as styled
 * text for now. Every consumer (AuthLayout, Navbar, Sidebar) should
 * import this one component rather than hardcoding the wordmark
 * themselves — once a real vector export is available, the swap
 * happens in exactly one place.
 */
const SIZES = {
  sm: 'text-sh2',
  md: 'text-sh1',
  lg: 'text-h4',
};

export default function Logo({ size = 'md', withTagline = false, className = '' }) {
  const sizeClasses = SIZES[size] || SIZES.md;

  return (
    <span className={['inline-flex flex-col', className].filter(Boolean).join(' ')}>
      <span className={['font-bold text-ink', sizeClasses].join(' ')}>
        Food<span className="text-accent-orange">Share</span>
      </span>
      {withTagline && (
        <span className="text-caption font-medium uppercase tracking-wide text-ink-faint">
          Surplus Food Marketplace
        </span>
      )}
    </span>
  );
}
