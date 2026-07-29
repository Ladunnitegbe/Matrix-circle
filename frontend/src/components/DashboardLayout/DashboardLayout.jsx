import { useEffect, useRef, useState } from 'react';

/**
 * DashboardLayout — the standard authenticated-app shell: a sidebar
 * (static on tablet+, a slide-in drawer on mobile), a top bar, main
 * content, and an optional footer.
 *
 * `renderSidebar` is a render function `(onClose) => ReactNode` rather
 * than a plain node — on tablet+ it's called with `undefined` (no
 * close button needed, since the sidebar is always visible), and on
 * mobile it's called with the drawer's close handler. This lets one
 * `<Sidebar>` definition serve both contexts instead of two separate
 * markup trees.
 *
 * Accessibility notes on the mobile drawer (best-effort, not a full
 * focus-trap implementation — flagging the gap rather than overstating
 * it): backdrop click and Escape both close it, body scroll is locked
 * while open, and focus moves to the drawer on open. Tabbing past the
 * drawer's last focusable element will currently escape into the page
 * behind it rather than wrapping back to the first — a complete trap
 * would need either a small utility or a dependency, and neither has
 * been added without checking with you first.
 */
export default function DashboardLayout({
  renderSidebar,
  navbar,
  footer,
  children,
  sidebarLabel = 'Sidebar navigation',
}) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    drawerRef.current?.focus();
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Static sidebar — tablet and up, slightly wider on laptop */}
      <div className="hidden tablet:flex tablet:w-64 laptop:w-72 tablet:flex-shrink-0 border-r border-border">
        {renderSidebar(undefined)}
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 tablet:hidden">
          <div
            className="absolute inset-0 bg-secondary/50"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={sidebarLabel}
            tabIndex={-1}
            className="relative z-50 h-full w-72 max-w-[85vw] shadow-lg outline-none"
          >
            {renderSidebar(() => setOpen(false))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 border-b border-border bg-primary-light px-4 py-3 tablet:px-6 laptop:px-8">
          <button
            type="button"
            className="tablet:hidden inline-flex items-center justify-center rounded-md p-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            aria-expanded={open}
            aria-controls="dashboard-sidebar-drawer"
            aria-label="Open sidebar"
            onClick={() => setOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">{navbar}</div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 tablet:p-6 laptop:p-8">{children}</main>

        {footer}
      </div>
    </div>
  );
}
