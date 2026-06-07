'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppData } from './app-data'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'ภาพรวม' },
  { href: '/courses', label: 'รายวิชา' },
  { href: '/plan', label: 'แผนเทอมหน้า' },
]

export function TopBar() {
  const { profile, saveProfile, email } = useAppData()
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/login')
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          PSU Stat Checker
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={cn(
                'rounded-md px-3 py-1.5 transition-colors hover:bg-accent',
                pathname.startsWith(n.href) ? 'bg-accent font-medium' : 'text-muted-foreground',
              )}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Select value={profile.plan} onValueChange={(v) => v && saveProfile({ plan: v as 'regular' | 'coop' })}>
            <SelectTrigger size="sm" className="w-[112px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">แผนปกติ</SelectItem>
              <SelectItem value="coop">แผนสหกิจ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={profile.geFramework} onValueChange={(v) => v && saveProfile({ geFramework: v as 'ge2565' | 'core2564' })}>
            <SelectTrigger size="sm" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ge2565">GE 2565 · 132</SelectItem>
              <SelectItem value="core2564">สาระ 2564 · 138</SelectItem>
            </SelectContent>
          </Select>
          <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>ออก</Button>
        </div>
      </div>
    </header>
  )
}
