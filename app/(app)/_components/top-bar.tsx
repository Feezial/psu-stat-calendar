'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppData } from './app-data'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'ภาพรวม' },
  { href: '/courses', label: 'รายวิชา' },
  { href: '/plan', label: 'แผนเทอมหน้า' },
]

const TITLES: Record<string, string> = {
  '/dashboard': 'ภาพรวม',
  '/courses': 'รายวิชาที่เรียน',
  '/plan': 'แผนเทอมหน้า',
  '/requirements': 'รายละเอียดหมวด',
}

export function TopBar() {
  const { profile, saveProfile } = useAppData()
  const pathname = usePathname()
  const title = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? ''

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/75 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 md:px-8">
        <Link href="/dashboard" className="font-semibold tracking-tight text-primary md:hidden">PSU Stat</Link>
        <h1 className="hidden text-lg font-semibold tracking-tight text-foreground md:block">{title}</h1>

        {/* mobile nav */}
        <nav className="flex items-center gap-0.5 text-sm md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={cn('rounded-lg px-2.5 py-1.5 transition-colors',
                pathname.startsWith(n.href) ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground')}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Select value={profile.plan} items={{ regular: 'แผนปกติ', coop: 'แผนสหกิจ' }}
            onValueChange={(v) => v && v !== profile.plan && saveProfile({ plan: v as 'regular' | 'coop' })}>
            <SelectTrigger size="sm" className="w-28 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">แผนปกติ</SelectItem>
              <SelectItem value="coop">แผนสหกิจ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={profile.geFramework} items={{ ge2565: 'GE 2565 · 132', core2564: 'สาระ 2564 · 138' }}
            onValueChange={(v) => v && v !== profile.geFramework && saveProfile({ geFramework: v as 'ge2565' | 'core2564' })}>
            <SelectTrigger size="sm" className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ge2565">GE 2565 · 132</SelectItem>
              <SelectItem value="core2564">สาระ 2564 · 138</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  )
}
