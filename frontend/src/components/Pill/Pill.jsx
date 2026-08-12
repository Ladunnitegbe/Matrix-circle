/**
 * Pill — small dark rounded label (distance, time-left, etc). Matches
 * the "0.4km" / "42m left" pills in the Discover Food and Claim Food
 * Figma cards. Extracted here (was a local function inside
 * DiscoverFoodPage) once ClaimFoodPage needed the identical style, to
 * avoid a second copy of the same three lines.
 */
export default function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-pill bg-secondary px-2.5 py-1 text-caption font-bold text-white">
      {children}
    </span>
  );
}
