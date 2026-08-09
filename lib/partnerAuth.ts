'use server'

import { createClient } from './supabase'

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
