'use client'

import Link from 'next/link'
import { useAppData } from './app-data'
import { TopBar } from './top-bar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { envOk, loading } = useAppData()

  if (!envOk) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Alert>
          <AlertTitle>ยังไม่ได้เชื่อม Supabase</AlertTitle>
          <AlertDescription>
            เปิดไฟล์ <code className="font-mono">SETUP.md</code> เพื่อสร้างโปรเจกต์ Supabase และใส่ค่าใน{' '}
            <code className="font-mono">.env.local</code> แล้วรีสตาร์ทเซิร์ฟเวอร์ จากนั้น{' '}
            <Link href="/login" className="underline">ไปหน้าเข้าสู่ระบบ</Link>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
