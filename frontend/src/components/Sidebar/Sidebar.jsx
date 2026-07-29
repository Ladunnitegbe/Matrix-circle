/**
 * Sidebar — vertical navigation panel. Deliberately has no built-in
 * open/close state of its own: it's used two ways —
 *   1. Statically, embedded directly in a desktop layout (no `onClose`)
 *   2. Inside a mobile drawer, where the drawer owns the open/close
 *      state and passes `onClose` down so Sidebar can render its own
 *      close button
 * `DashboardLayout` composes this component for both cases rather than
 * duplicating sidebar markup for "desktop" and "mobile" separately.
 *
 * Accessibility: `<aside>` is the landmark for the whole panel; the
 * actual links live in a nested `<nav aria-label="Sidebar">` so screen
 * reader users can jump straight to navigation, distinct from the
 * `<aside>` region itself (which may also contain a brand/footer).
 */
export default function Sidebar({
  brand,
  children,
  footer,
  onClose,
  ariaLabel = 'Sidebar',
  className = '',
}) {
  return (
    <aside
      className={['flex h-full flex-col bg-primary-light', className].filter(Boolean).join(' ')}
    >
      {(brand || onClose) && (
        <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-border">
          <div className="min-w-0">{brand}</div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="rounded-md p-2 text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>
      )}

      <nav aria-label={ariaLabel} className="flex-1 overflow-y-auto px-3 py-4 laptop:px-4 laptop:py-5">
        <div className="flex flex-col gap-1">{children}</div>
      </nav>

      {footer && <div className="border-t border-border px-4 py-4">{footer}</div>}
    </aside>
  );
}
