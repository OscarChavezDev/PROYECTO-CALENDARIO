import { useEffect, useState } from 'react'
import { TaskForm } from './TaskForm'
import { TaskList } from './TaskList'
import {
  completeTask,
  createTask,
  deleteTask,
  listTasks,
  postponeTask,
  updateTask,
} from './taskService'
import type { Task, TaskFormValues } from './types'

export function TasksSection({
  userId,
  calendarId,
}: {
  userId: string
  calendarId: string
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Task | null>(null)

  useEffect(() => {
    let cancelled = false
    listTasks()
      .then((data) => {
        if (!cancelled) {
          setTasks(data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando tareas.')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  function replaceTask(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function handleCreate(values: TaskFormValues) {
    const created = await createTask(userId, calendarId, values)
    setTasks((prev) => [...prev, created])
  }

  async function handleUpdate(values: TaskFormValues) {
    if (!editing) return
    replaceTask(await updateTask(editing.id, values))
    setEditing(null)
  }

  async function handleComplete(task: Task) {
    try {
      replaceTask(await completeTask(task.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error completando la tarea.')
    }
  }

  async function handlePostpone(task: Task) {
    try {
      replaceTask(await postponeTask(task.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error posponiendo la tarea.')
    }
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) return
    try {
      await deleteTask(task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      if (editing?.id === task.id) setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando la tarea.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          {editing ? `Editar tarea: ${editing.title}` : 'Crear tarea'}
        </h2>
        <TaskForm
          key={editing?.id ?? 'new'}
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Tareas</h2>
        {error && (
          <p role="alert" className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-slate-500">Cargando tareas…</p>
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={setEditing}
            onDelete={handleDelete}
            onComplete={handleComplete}
            onPostpone={handlePostpone}
          />
        )}
      </section>
    </div>
  )
}
