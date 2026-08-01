export default function Sidebar({ brand, children, footer, onClose, ariaLabel = 'Sidebar', className = '' }) {
  return (
    <aside className={['flex h-full flex-col bg-primary-light', className].filter(Boolean).join(' ')}>
      {(brand || onClose) && (
        <div className="flex items-center justify-between gap-2 border-b-2 border-accent-orange-light px-4 py-4">
          <div className="min-w-0">{brand}</div>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Close sidebar" className="rounded-md p-2 text-ink-faint hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          )}
        </div>
      )}
      <nav aria-label={ariaLabel} className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-1">{children}</div>
      </nav>
      {footer && <div className="px-4 py-4">{footer}</div>}
    </aside>
  );
}
