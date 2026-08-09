import { useEffect, useRef, useState } from 'react';

export default function DashboardLayout({ renderSidebar, navbar, footer, children, sidebarLabel = 'Sidebar navigation' }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    drawerRef.current?.focus();
    document.body.style.overflow = 'hidden';
    function handleKeyDown(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="min-h-screen flex bg-surface">
      <div className="hidden tablet:flex tablet:w-64 laptop:w-72 tablet:flex-shrink-0 border-r border-border">
        {renderSidebar(undefined)}
      </div>

      {open && (
        <div className="fixed inset-0 z-40 tablet:hidden">
          <div className="absolute inset-0 bg-secondary/50" aria-hidden="true" onClick={() => setOpen(false)} />
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label={sidebarLabel} tabIndex={-1} className="relative z-50 h-full w-72 max-w-[85vw] shadow-lg outline-none">
            {renderSidebar(() => setOpen(false))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 border-b border-border bg-primary-light px-4 py-3 tablet:hidden">
          <button type="button" className="inline-flex items-center justify-center rounded-md p-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            aria-expanded={open} aria-controls="dashboard-sidebar-drawer" aria-label="Open sidebar" onClick={() => setOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <div className="flex-1 min-w-0">{navbar}</div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 tablet:p-6 laptop:p-8">{children}</main>
        {footer}
      </div>
    </div>
  );
}
