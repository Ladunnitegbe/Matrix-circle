/**
 * PageContainer — responsive max-width wrapper used at the top of any
 * page or section. Pure layout, no color decisions (colors always come
 * from the Tailwind theme, never hardcoded here).
 *
 * Note: this project already has an older `ScreenContainer` component
 * (built before the Figma design system existed) doing a similar job
 * with hand-rolled breakpoints. Left untouched for now — flagging that
 * the two should likely be reconciled/merged once app pages are built.
 */

const SIZES = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-6xl',
  full: 'max-w-none',
};

export default function PageContainer({
  children,
  size = 'lg', // 'sm' | 'md' | 'lg' | 'full'
  as = 'div',
  className = '',
}) {
  const Tag = as;
  const classes = [
    'w-full mx-auto',
    'px-4 tablet:px-6 laptop:px-8',
    SIZES[size] || SIZES.lg,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes}>{children}</Tag>;
}
