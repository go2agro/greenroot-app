import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin configuration')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function listAllStoragePaths(
  supabase: SupabaseClient,
  bucket: string,
  prefix: string
): Promise<string[]> {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  })

  if (error || !data?.length) return []

  const paths: string[] = []

  for (const item of data) {
    const itemPath = prefix ? `${prefix}/${item.name}` : item.name

    if (item.id === null) {
      paths.push(...(await listAllStoragePaths(supabase, bucket, itemPath)))
    } else {
      paths.push(itemPath)
    }
  }

  return paths
}

export async function removeStoragePaths(
  supabase: SupabaseClient,
  bucket: string,
  paths: string[]
) {
  const uniquePaths = [...new Set(paths.filter(Boolean))]
  const chunkSize = 100

  for (let i = 0; i < uniquePaths.length; i += chunkSize) {
    const chunk = uniquePaths.slice(i, i + chunkSize)
    const { error } = await supabase.storage.from(bucket).remove(chunk)
    if (error) throw error
  }
}
