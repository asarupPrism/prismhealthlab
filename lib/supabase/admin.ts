import { createClient } from '@supabase/supabase-js'

// Admin client with service role key for webhook operations and admin tasks
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export a singleton instance for convenience
// Note: Only use this in server-side contexts (API routes, webhooks)
let adminClient: ReturnType<typeof createAdminClient> | null = null

export function getAdminClient() {
  if (!adminClient) {
    adminClient = createAdminClient()
  }
  return adminClient
}