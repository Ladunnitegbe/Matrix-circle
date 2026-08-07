import { useState } from 'react';

/**
 * Navbar — horizontal top nav with brand + nav-item children + a
 * right-aligned actions slot (e.g. Login/Register buttons), plus a
 * built-in accessible mobile collapse. Unopinionated about routing —
 * pass real <a>/<Link> elements as children.
 */
export default function Navbar({ brand, children, actions, ariaLabel = 'Main', className = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <nav aria-label={ariaLabel} className={['bg-primary-light border-b border-border', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between gap-4 px-4 py-3 tablet:px-6 laptop:px-8">
        <div className="flex-shrink-0">{brand}</div>
        <div className="hidden tablet:flex tablet:items-center tablet:gap-6">{children}</div>
        <div className="hidden tablet:flex tablet:items-center tablet:gap-3">{actions}</div>

        <button
          type="button"
          className="tablet:hidden inline-flex items-center justify-center rounded-md p-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          aria-expanded={open}
          aria-controls="navbar-mobile-panel"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div id="navbar-mobile-panel" className="tablet:hidden border-t border-border px-4 py-3">
          <div className="flex flex-col gap-3">{children}</div>
          {actions && <div className="mt-3 flex flex-col gap-2">{actions}</div>}
        </div>
      )}
    </nav>
  );
}
