import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo.jsx';
import { MenuIcon, XIcon } from '../Icon/Icon.jsx';
import { clearSession, getAccount } from '../../lib/authStorage.js';

/**
 * AppTopBar — the simple Logo + hamburger header shown across every
 * authenticated screen (Discover Food, Create List, Claim, Release).
 * Distinct from the full `Navbar` component: that one is built for a
 * marketing page with visible nav links; this is the compact in-app
 * bar the Figma shows, where the hamburger opens an account menu
 * rather than a set of page-level nav items.
 */
export default function AppTopBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const account = getAccount();

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <header className="relative border-b border-border bg-primary-light">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 tablet:px-6 laptop:px-8">
        <Logo size="sm" />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="app-top-bar-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-md p-2 text-accent-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
        >
          {open ? <XIcon width={22} height={22} /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div
          id="app-top-bar-menu"
          className="absolute right-4 top-full z-10 mt-1 w-56 rounded-lg border border-border bg-primary-light shadow-lg tablet:right-6 laptop:right-8"
        >
          <nav aria-label="Account" className="flex flex-col p-2">
            <Link
              to="/discover"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-body2 font-medium text-ink hover:bg-secondary-light"
            >
              Discover Food
            </Link>
            {account?.role === 'vendor' && (
              <Link
                to="/create-listing"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-body2 font-medium text-ink hover:bg-secondary-light"
              >
                Share Surplus Food
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md px-3 py-2 text-left text-body2 font-medium text-danger hover:bg-secondary-light"
            >
              Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
