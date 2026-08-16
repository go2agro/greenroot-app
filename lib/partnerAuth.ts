'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from './supabase'
import { createAdminClient } from './supabase-admin'

type PartnerAuthError = {
  message: string
  code?: string | null
}

export async function getPartnerUserId(): Promise<{
  userId: string | null
  error: PartnerAuthError | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { userId: null, error: { message: 'Not logged in' } }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return {
      userId: null,
      error: {
        message: profileError.message || 'Failed to verify partner access',
        code: profileError.code ?? null,
      },
    }
  }

  if (profile?.role !== 'partner') {
    return { userId: null, error: { message: 'Unauthorized' } }
  }

  return { userId: user.id, error: null }
}

export async function getPartnerDbClient(): Promise<{
  client: SupabaseClient | null
  userId: string | null
  error: PartnerAuthError | null
}> {
  const { userId, error } = await getPartnerUserId()
  if (!userId) return { client: null, userId: null, error }

  try {
    return { client: createAdminClient(), userId, error: null }
  } catch {
    return {
      client: null,
      userId: null,
      error: { message: 'Partner configuration missing' },
    }
  }
}
