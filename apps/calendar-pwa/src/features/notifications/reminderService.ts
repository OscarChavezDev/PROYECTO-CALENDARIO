import { requireClient } from '../../lib/supabase/requireClient'
import { VALID_OFFSET_MINUTES } from './reminderConstants'

export type ReminderEntityType = 'event' | 'task'

/** remind_at = anchor − offset minutos, en ISO UTC. (helper puro, testeable) */
export function remindAtFor(anchorIso: string, offsetMinutes: number): string {
  return new Date(new Date(anchorIso).getTime() - offsetMinutes * 60_000).toISOString()
}

/** Reconstruye los offsets (en minutos) a partir del anchor y los remind_at guardados. */
export function offsetsFromReminders(anchorIso: string, remindAtList: string[]): number[] {
  const anchor = new Date(anchorIso).getTime()
  return remindAtList
    .map((remindAt) => Math.round((anchor - new Date(remindAt).getTime()) / 60_000))
    .filter((minutes) => VALID_OFFSET_MINUTES.includes(minutes))
    .sort((a, b) => a - b)
}

function columnFor(entityType: ReminderEntityType): 'event_id' | 'task_id' {
  return entityType === 'event' ? 'event_id' : 'task_id'
}

interface CreateRemindersParams {
  entityId: string
  entityType: ReminderEntityType
  userId: string
  anchorAt: string
  offsets: number[]
}

export async function createReminders(params: CreateRemindersParams): Promise<void> {
  if (params.offsets.length === 0) return
  const supabase = requireClient()
  const column = columnFor(params.entityType)
  const rows = params.offsets.map((offset) => ({
    user_id: params.userId,
    [column]: params.entityId,
    remind_at: remindAtFor(params.anchorAt, offset),
    channel: 'push',
    status: 'pending',
  }))
  const { error } = await supabase.from('reminders').insert(rows)
  if (error) throw new Error(`No se pudieron crear los recordatorios: ${error.message}`)
  // TODO: email backup — cuando el canal sea 'email' o 'both', encolar correo de respaldo.
}

/** Offsets en minutos de los reminders de una entidad (lee su anchor de la BD). */
export async function listReminderOffsets(
  entityType: ReminderEntityType,
  entityId: string,
): Promise<number[]> {
  const supabase = requireClient()

  const anchorTable = entityType === 'event' ? 'events' : 'tasks'
  const anchorColumn = entityType === 'event' ? 'starts_at' : 'due_at'
  const { data: anchorRow, error: anchorError } = await supabase
    .from(anchorTable)
    .select(anchorColumn)
    .eq('id', entityId)
    .maybeSingle()
  if (anchorError) throw new Error(anchorError.message)
  const anchorAt = (anchorRow as Record<string, string | null> | null)?.[anchorColumn]
  if (!anchorAt) return []

  const { data, error } = await supabase
    .from('reminders')
    .select('remind_at')
    .eq(columnFor(entityType), entityId)
  if (error) throw new Error(error.message)

  return offsetsFromReminders(
    anchorAt,
    (data ?? []).map((r) => (r as { remind_at: string }).remind_at),
  )
}

export async function deleteReminders(
  entityType: ReminderEntityType,
  entityId: string,
): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq(columnFor(entityType), entityId)
  if (error) throw new Error(`No se pudieron borrar los recordatorios: ${error.message}`)
}

export async function replaceReminders(params: CreateRemindersParams): Promise<void> {
  await deleteReminders(params.entityType, params.entityId)
  await createReminders(params)
}
