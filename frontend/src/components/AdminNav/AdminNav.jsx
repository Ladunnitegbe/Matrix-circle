import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Logo from '../Logo/Logo.jsx';
import Button from '../Button/Button.jsx';
import { LogoutIcon } from '../Icon/Icon.jsx';
import { clearSession } from '../../lib/authStorage.js';

/**
 * AdminNav — sidebar for the admin role: "Review Charity Orgs" and
 * "Summary" only, plus Logout. Deliberately separate from `AppNav`
 * (vendor/recipient sidebar) rather than overloading one component
 * with a third role branch — admin's nav items, and what "active"
 * means for them, don't overlap with the other two roles at all.
 */
function NavItem({ to, label, active }) {
  const classes = [
    'rounded-md px-3 py-2 text-body2 font-semibold',
    active ? 'bg-accent-orange-light text-accent-orange' : 'text-ink hover:bg-secondary-light',
  ].join(' ');
  return <Link to={to} className={classes}>{label}</Link>;
}

export default function AdminNav({ onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  const items = [
    { label: 'Review Charity Orgs', to: '/admin', active: location.pathname === '/admin' },
    { label: 'Summary', to: '/admin/summary', active: location.pathname === '/admin/summary' },
  ];

  return (
    <Sidebar
      brand={<Logo size="sm" withTagline className="tablet:h-16" />}
      onClose={onCloseMobile}
      footer={
        <Button color="accent" variant="outlined" fullWidth onClick={handleLogout} iconLeft={<LogoutIcon />}>
          Logout
        </Button>
      }
    >
      {items.map((item) => (
        <NavItem key={item.label} to={item.to} label={item.label} active={item.active} />
      ))}
    </Sidebar>
  );
}
