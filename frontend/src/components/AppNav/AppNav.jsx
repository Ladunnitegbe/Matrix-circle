import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Logo from '../Logo/Logo.jsx';
import Button from '../Button/Button.jsx';
import { clearSession, getAccount } from '../../lib/authStorage.js';

/**
 * AppNav — the sidebar content shown across every authenticated
 * screen, matching the new Figma sidebar exactly:
 *   - Vendor: Dashboard / New Listing / Confirm Pickup
 *   - Recipient / Charity / Organization: Discovery Feed / Listing
 *     Detail / Claim & Hold
 * ...plus the "Share Surplus Food" button pinned at the bottom,
 * which the Figma shows on *every* sidebar regardless of role.
 *
 * "Listing Detail" and "Claim & Hold" don't have a generic
 * destination — they're steps tied to whichever listing is currently
 * being claimed, not standalone pages. Passing `listingId` (only
 * known once a listing is actually open) makes them real links to
 * that listing's detail/hold routes; without it, they render as
 * inert labels rather than linking somewhere meaningless.
 */
function NavItem({ to, label, active, disabled }) {
  const classes = [
    'rounded-md px-3 py-2 text-body2 font-semibold',
    active ? 'bg-accent-orange-light text-accent-orange' : disabled ? 'cursor-default text-ink-faint' : 'text-ink hover:bg-secondary-light',
  ].join(' ');
  if (disabled) return <span className={classes}>{label}</span>;
  return <Link to={to} className={classes}>{label}</Link>;
}

export default function AppNav({ listingId, onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const account = getAccount();
  const isVendor = account?.role === 'vendor';

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  const items = isVendor
    ? [
        { label: 'Dashboard', to: '/vendor/dashboard', active: location.pathname === '/vendor/dashboard' },
        { label: 'New Listing', to: '/create-listing', active: location.pathname === '/create-listing' },
        { label: 'Confirm Pickup', to: '/vendor/confirm-pickup', active: location.pathname === '/vendor/confirm-pickup' },
      ]
    : [
        { label: 'Discovery Feed', to: '/discover', active: location.pathname === '/discover' },
        {
          label: 'Listing Detail',
          to: listingId ? `/claim/${listingId}` : null,
          active: location.pathname.startsWith('/claim/') && !location.pathname.endsWith('/hold'),
          disabled: !listingId,
        },
        {
          label: 'Claim & Hold',
          to: listingId ? `/claim/${listingId}/hold` : null,
          active: location.pathname.endsWith('/hold'),
          disabled: !listingId,
        },
      ];

  return (
    <Sidebar
      brand={<Logo size="sm" withTagline />}
      onClose={onCloseMobile}
      footer={
        <div className="flex flex-col gap-2">
          <Button color="accent" variant="solid" fullWidth onClick={() => navigate('/create-listing')}>
            Share Surplus Food
          </Button>
          <button type="button" onClick={handleLogout} className="text-center text-caption font-semibold text-ink-faint hover:text-ink">
            Log out
          </button>
        </div>
      }
    >
      {items.map((item) => (
        <NavItem key={item.label} to={item.to} label={item.label} active={item.active} disabled={item.disabled} />
      ))}
    </Sidebar>
  );
}
