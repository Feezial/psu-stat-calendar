import { Badge } from '@/components/ui/badge'
import { isPass } from '@/lib/engine/grades'
import type { ReqResult } from '@/lib/engine/progress'

export function statusBarClass(status: ReqResult['status']): string {
  if (status === 'done') return 'bg-emerald-500'
  if (status === 'partial') return 'bg-amber-500'
  return 'bg-rose-400'
}

export function statusTextClass(status: ReqResult['status']): string {
  if (status === 'done') return 'text-emerald-600 dark:text-emerald-400'
  if (status === 'partial') return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

export function StatusBadge({ status }: { status: ReqResult['status'] }) {
  if (status === 'done')
    return <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">ครบ</Badge>
  if (status === 'partial')
    return <Badge className="bg-amber-500 text-white hover:bg-amber-500">บางส่วน</Badge>
  return <Badge variant="outline" className="border-rose-400 text-rose-600">ยังไม่เริ่ม</Badge>
}

export function GradeBadge({ grade }: { grade: string }) {
  const pass = isPass(grade)
  const g = grade || '—'
  return (
    <Badge
      variant="outline"
      className={
        pass
          ? 'border-emerald-400 text-emerald-700 dark:text-emerald-400'
          : 'border-rose-400 text-rose-700 dark:text-rose-400'
      }
    >
      {g}
    </Badge>
  )
}
