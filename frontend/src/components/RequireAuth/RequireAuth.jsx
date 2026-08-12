import { Navigate, useLocation } from 'react-router-dom';
import { getAccount, getToken } from '../../lib/authStorage.js';

/**
 * `role` accepts either a single role string (all existing call
 * sites) or an array of roles — added for RecipientProfilePage, the
 * first route both `individual` AND `charity` accounts need access to
 * while `vendor`/`admin` don't. Backward compatible: a single string
 * still behaves exactly as before.
 */
export default function RequireAuth({ children, role }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (role) {
    const account = getAccount();
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!account || !allowedRoles.includes(account.role)) {
      return <Navigate to="/discover" replace />;
    }
  }
  return children;
}
