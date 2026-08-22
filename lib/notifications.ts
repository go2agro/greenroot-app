'use server'

import { createClient } from './supabase'
import { createAdminClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// ─────────────────────────────────────────
// GET MY NOTIFICATIONS
// ─────────────────────────────────────────
export async function getMyNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET UNREAD COUNT
// ─────────────────────────────────────────
export async function getUnreadCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return toPlainResponse({ count }, error)
}

// ─────────────────────────────────────────
// MARK SINGLE AS READ
// ─────────────────────────────────────────
export async function markAsRead(notificationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// DELETE NOTIFICATION
// ─────────────────────────────────────────
export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// MARK ALL AS READ
// ─────────────────────────────────────────
export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET NOTIFICATIONS BY CATEGORY
// ─────────────────────────────────────────
export async function getNotificationsByCategory(
  category?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return toPlainResponse(null, { message: 'Not logged in' })

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    if (category === 'unread') {
      query = query.eq('is_read', false)
    } else {
      query = query.eq('category', category)
    }
  }

  const { data, error } = await query
  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// CREATE NOTIFICATION (internal use only)
// uses admin client to bypass RLS
// ─────────────────────────────────────────
export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedId,
  relatedType,
  category
}: {
  userId: string
  type: string
  title: string
  message: string
  relatedId?: string
  relatedType?: string
  category?: 'application' | 'interview' | 'system'
}) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId || null,
      related_type: relatedType || null,
      category: category || 'system'
    })

  return toPlainResponse(data, error)
}