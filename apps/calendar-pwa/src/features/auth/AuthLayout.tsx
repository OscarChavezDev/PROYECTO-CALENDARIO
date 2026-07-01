import { Outlet } from 'react-router-dom'

/** Las pantallas de auth son autónomas a pantalla completa (sin sidebar). */
export function AuthLayout() {
  return <Outlet />
}
