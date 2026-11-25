import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { FinanceProvider } from '../store/FinanceContext'
import { FullScreenMessage } from './FullScreenMessage'

/** Only logged-in users get past this. Data is loaded once per login. */
export function RequireAuth() {
  const { user, checking } = useAuth()
  const location = useLocation()
  if (checking) return <FullScreenMessage title="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return (
    <FinanceProvider key={user.id}>
      <Outlet />
    </FinanceProvider>
  )
}

/** Login and signup pages: logged-in users are sent to the dashboard instead. */
export function PublicOnly() {
  const { user, checking } = useAuth()
  if (checking) return <FullScreenMessage title="Checking your session…" />
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
