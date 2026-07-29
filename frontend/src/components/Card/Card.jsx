/**
 * Card — generic surface container.
 *
 * NOTE: replaces an earlier plain-CSS Card built before the Figma
 * design system existed. Old mobile-only screens (ListingCard, etc.)
 * still reference the old version's class names — flagging rather
 * than silently leaving two differently-styled "Card" components in
 * the project.
 */
const PADDING = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({ children, padding = 'md', as = 'div', className = '' }) {
  const Tag = as;
  return (
    <Tag
      className={[
        'rounded-lg border border-border bg-primary-light',
        PADDING[padding] || PADDING.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}
