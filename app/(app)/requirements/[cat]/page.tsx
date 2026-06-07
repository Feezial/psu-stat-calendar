'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAppData } from '../../_components/app-data'
import { StatusBadge } from '../../_components/status'
import { CATEGORY_LABEL } from '@/lib/engine/progress'
import type { Category } from '@/lib/curriculum/types'
import { setOverride, clearOverride } from '@/lib/data/repository'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const VALID: Category[] = ['foundation', 'core', 'major_elective', 'ge', 'free_elective']

export default function RequirementCategoryPage() {
  const params = useParams<{ cat: string }>()
  const cat = params.cat as Category
  const { progress, taken, overrides, refresh } = useAppData()

  if (!VALID.includes(cat)) {
    return <p className="text-muted-foreground">ไม่พบหมวดนี้ <Link href="/dashboard" className="underline">กลับ</Link></p>
  }

  const reqs = progress.requirements.filter((r) => r.category === cat)
  const catResult = progress.categories.find((c) => c.category === cat)!

  async function pin(requirementId: string, value: string) {
    try {
      if (value === '__clear__') {
        await clearOverride(requirementId)
      } else {
        const [code, term] = value.split('|')
        await setOverride({ requirementId, takenCode: code, term })
      }
      await refresh()
      toast.success('อัปเดตการจับคู่แล้ว')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ผิดพลาด')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-muted-foreground underline">← ภาพรวม</Link>
        <h1 className="text-lg font-semibold">{CATEGORY_LABEL[cat]}</h1>
        <Badge variant="secondary" className="ml-auto tabular-nums">
          {catResult.doneCredits} / {catResult.needCredits} นก
        </Badge>
      </div>

      <div className="space-y-3">
        {reqs.map((r) => {
          const ovForThis = overrides.find((o) => o.requirementId === r.id)
          return (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start justify-between gap-2 text-sm font-medium">
                  <span>{r.label}</span>
                  <StatusBadge status={r.status} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="tabular-nums text-muted-foreground">{r.doneCredits} / {r.needCredits} นก</div>

                {r.matched.length > 0 && (
                  <ul className="space-y-1">
                    {r.matched.map((m) => (
                      <li key={`${m.code}-${m.term}`} className="flex items-center gap-2">
                        <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">{m.grade}</Badge>
                        <span className="font-mono text-xs">{m.code}</span>
                        <span className="flex-1">{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.term}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {r.missing.length > 0 && (
                  <div className="text-rose-600">
                    ขาด: {r.missing.map((m) => `${m.code} ${m.name} (${m.credits})`).join(', ')}
                  </div>
                )}

                {r.verifyNote && (
                  <div className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    ⚠️ {r.verifyNote}
                  </div>
                )}

                {/* override: ปักหมุดวิชาเข้าช่องนี้เอง */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">ปักหมุดเอง:</span>
                  <Select value={ovForThis ? `${ovForThis.takenCode}|${ovForThis.term}` : ''}
                    onValueChange={(v) => v && pin(r.id, v)}>
                    <SelectTrigger size="sm" className="w-[230px]">
                      <SelectValue placeholder="เลือกวิชา…" />
                    </SelectTrigger>
                    <SelectContent>
                      {taken.map((t) => (
                        <SelectItem key={`${t.code}-${t.term}`} value={`${t.code}|${t.term}`}>
                          {t.code} · {t.term} ({t.grade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {ovForThis && (
                    <Button variant="ghost" size="sm" onClick={() => pin(r.id, '__clear__')}>ล้าง</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {progress.extra.length > 0 && cat === 'free_elective' && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">วิชาที่ผ่านแต่ยังไม่ถูกจัดเข้าหมวด</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {progress.extra.map((e) => `${e.code} (${e.term})`).join(', ')}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
