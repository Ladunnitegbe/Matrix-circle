import { Navigate, useLocation } from 'react-router-dom';
import { getAccount, getToken } from '../../lib/authStorage.js';

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
