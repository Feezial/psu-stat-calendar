import { isPass } from '@/lib/engine/grades'
import type { ReqResult } from '@/lib/engine/progress'

export function statusBarClass(status: ReqResult['status']): string {
  if (status === 'done') return 'bg-emerald-500'
  if (status === 'partial') return 'bg-amber-500'
  return 'bg-slate-300'
}

export function statusTextClass(status: ReqResult['status']): string {
  if (status === 'done') return 'text-emerald-600'
  if (status === 'partial') return 'text-amber-600'
  return 'text-slate-500'
}

const PILL = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'

export function StatusBadge({ status }: { status: ReqResult['status'] }) {
  if (status === 'done')
    return <span className={`${PILL} bg-emerald-100 text-emerald-700`}>ครบ</span>
  if (status === 'partial')
    return <span className={`${PILL} bg-amber-100 text-amber-700`}>บางส่วน</span>
  return <span className={`${PILL} bg-slate-100 text-slate-500`}>ยังไม่เริ่ม</span>
}

export function GradeBadge({ grade }: { grade: string }) {
  const pass = isPass(grade)
  const g = grade || '—'
  return (
    <span
      className={
        'inline-flex min-w-7 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold ' +
        (pass ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-600 ring-1 ring-rose-200')
      }
    >
      {g}
    </span>
  )
}
