import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * PrivateRoute — Protects routes based on authentication and role.
 * @param {string[]} allowedRoles - e.g. ['ADMIN', 'STAFF']. Empty = any authenticated user.
 */
export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
