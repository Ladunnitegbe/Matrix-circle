const SIZES = { sm: 'h-8 w-8 text-caption', md: 'h-10 w-10 text-body2', lg: 'h-14 w-14 text-sh2' };
function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
export default function Avatar({ src, alt, name, size = 'md', className = '' }) {
  const sizeClasses = SIZES[size] || SIZES.md;
  if (src) {
    return <img src={src} alt={alt || name || ''} className={['flex-shrink-0 rounded-full object-cover', sizeClasses, className].filter(Boolean).join(' ')} />;
  }
  return (
    <span role="img" aria-label={alt || name || 'User avatar'} className={['inline-flex flex-shrink-0 items-center justify-center rounded-full bg-accent-green-light font-bold text-accent-green-dark', sizeClasses, className].filter(Boolean).join(' ')}>
      {getInitials(name) || '?'}
    </span>
  );
}
