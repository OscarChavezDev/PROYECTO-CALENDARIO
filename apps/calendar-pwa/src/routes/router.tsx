import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../app/AppLayout'
import { HomePage } from './HomePage'
import { LoginPage } from '../features/auth/LoginPage'
import { CalendarPage } from '../features/calendar/CalendarPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      // Futura ruta protegida: requerirá sesión de Supabase (Sprint 1)
      { path: '/app', element: <CalendarPage /> },
    ],
  },
])
