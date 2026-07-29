import './Skeleton.css';

/** Skeleton — loading placeholder. Mirrors the real layout's shape so
 * nothing "pops" once content arrives (loading state, per design system). */
export default function Skeleton({ width = '100%', height = '14px', radius = '8px' }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius }} />;
}
