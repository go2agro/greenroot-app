"use server"

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from './supabase'
import { createAdminClient } from './supabase-admin'

type AdminAuthError = {
  message: string
  code?: string | null
  status?: number | null
}

export async function getAdminDbClient(): Promise<{
  client: SupabaseClient | null
  userId: string | null
  error: AdminAuthError | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { client: null, userId: null, error: { message: 'Not logged in' } }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return {
      client: null,
      userId: null,
      error: {
        message: profileError.message || 'Failed to verify admin access',
        code: profileError.code ?? null,
      },
    }
  }

  if (profile?.role !== 'admin') {
    return { client: null, userId: null, error: { message: 'Unauthorized' } }
  }

  try {
    return { client: createAdminClient(), userId: user.id, error: null }
  } catch {
    return {
      client: null,
      userId: null,
      error: { message: 'Admin configuration missing' },
    }
  }
}
