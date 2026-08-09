import type { SupabaseClient } from '@supabase/supabase-js'

export async function generateAccountId(
  supabase: SupabaseClient,
  prefix: 'ADM' | 'PTR'
): Promise<string> {
  const year = new Date().getFullYear()
  const idPrefix = `${prefix}-${year}-`

  const { data } = await supabase
    .from('profiles')
    .select('unique_id')
    .like('unique_id', `${idPrefix}%`)
    .order('unique_id', { ascending: false })
    .limit(1)

  let nextNum = 1
  if (data?.[0]?.unique_id) {
    const lastPart = data[0].unique_id.slice(idPrefix.length)
    const parsed = parseInt(lastPart, 10)
    if (!Number.isNaN(parsed)) nextNum = parsed + 1
  }

  return `${idPrefix}${String(nextNum).padStart(5, '0')}`
}
