'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, BookOpenCheck, CalendarClock } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/courses', label: 'รายวิชา', icon: BookOpenCheck },
  { href: '/plan', label: 'เทอมหน้า', icon: CalendarClock },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1">
        {NAV.map((n) => {
          const active = pathname.startsWith(n.href)
          const Icon = n.icon
          return (
            <Link key={n.href} href={n.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}>
              <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 2} />
              {n.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
