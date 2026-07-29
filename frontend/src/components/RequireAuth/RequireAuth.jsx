import { Navigate, useLocation } from 'react-router-dom';
import { getAccount, getToken } from '../../lib/authStorage.js';

/**
 * RequireAuth — redirects to /login if there's no stored token.
 *
 * Optional `role` prop gates by account role (e.g. Create List is
 * vendor-only, per `POST /listings` requiring role `vendor`). A
 * logged-in user with the wrong role is sent to `/discover`, not
 * `/login` — they *are* authenticated, just not permitted for this
 * specific page, mirroring the API's own 401-vs-403 distinction
 * (documented for `/vendors/me`: missing token vs. wrong role are
 * different problems, not the same "go log in" case).
 */
export default function RequireAuth({ children, role }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role) {
    const account = getAccount();
    if (!account || account.role !== role) {
      return <Navigate to="/discover" replace />;
    }
  }

  return children;
}
