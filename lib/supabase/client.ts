import { createBrowserClient } from '@supabase/ssr'

export function hasSupabaseEnv(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

const make = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

// Singleton: client ตัวเดียวทั้งแอป — กัน GoTrueClient หลายตัวแย่ง Web Lock จน getUser/getSession ค้าง
let client: ReturnType<typeof make> | undefined

export function createClient() {
  client ??= make()
  return client
}
