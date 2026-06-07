import { createBrowserClient } from '@supabase/ssr'

export function hasSupabaseEnv(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Singleton: ใช้ client ตัวเดียวทั้งแอป — กัน GoTrueClient หลายตัวแย่ง Web Lock กันจน getUser() ค้าง
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (client) return client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return client
}
