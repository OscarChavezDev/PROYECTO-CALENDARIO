import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CalendarItem } from '../features/calendar/calendarTypes'
import type { Task } from '../features/tasks/types'

/** Datos que la pantalla del calendario publica para que la sidebar muestre widgets. */
export interface CalendarSidebarData {
  items: CalendarItem[]
  tasks: Task[]
  onOpen: (item: CalendarItem) => void
  onCompleteTask: (task: Task) => void
}

interface SidebarCtx {
  data: CalendarSidebarData | null
  setData: (data: CalendarSidebarData | null) => void
}

const Ctx = createContext<SidebarCtx>({ data: null, setData: () => {} })

export function CalendarSidebarProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CalendarSidebarData | null>(null)
  return <Ctx.Provider value={{ data, setData }}>{children}</Ctx.Provider>
}

export function useCalendarSidebar() {
  return useContext(Ctx)
}
