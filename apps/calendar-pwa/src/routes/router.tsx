import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../app/AppLayout'
import { HomePage } from './HomePage'
import { AuthLayout } from '../features/auth/AuthLayout'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { CalendarPage } from '../features/calendar/CalendarPage'
import { ItemDetailPage } from '../features/calendar/ItemDetailPage'
import { NotificationSettings } from '../features/notifications/NotificationSettings'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/app', element: <CalendarPage /> },
          { path: '/ajustes', element: <NotificationSettings /> },
          { path: '/evento/:id', element: <ItemDetailPage kind="evento" /> },
          { path: '/tarea/:id', element: <ItemDetailPage kind="tarea" /> },
        ],
      },
    ],
  },
])
