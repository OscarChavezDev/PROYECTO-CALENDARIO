import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../app/AppLayout'
import { HomePage } from './HomePage'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { CalendarPage } from '../features/calendar/CalendarPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/app', element: <CalendarPage /> }],
      },
    ],
  },
])
