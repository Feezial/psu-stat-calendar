'use client'

import Link from 'next/link'
import { useAppData } from '../_components/app-data'
import { CATEGORY_LABEL } from '@/lib/engine/progress'
import { suggestNextTerm } from '@/lib/engine/progress'
import { buildProgram } from '@/lib/curriculum/program-2564'
import { StatusBadge, statusBarClass } from '../_components/status'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const { progress, profile, taken } = useAppData()
  const pct = progress.totalNeed ? Math.round((progress.totalDone / progress.totalNeed) * 100) : 0
  const remaining = Math.max(progress.totalNeed - progress.totalDone, 0)

  const verifyFlags = progress.requirements.filter((r) => r.verifyNote && r.status !== 'done')

  const at = { year: profile.currentYear ?? 3, term: profile.currentTerm ?? 1 }
  const next = suggestNextTerm(buildProgram(profile.plan, profile.geFramework), taken, [], at)

  return (
    <div className="space-y-6">
      {/* ── ภาพรวมรวม ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>ความคืบหน้ารวม</span>
            <Badge variant="secondary">{profile.plan === 'coop' ? 'แผนสหกิจ' : 'แผนปกติ'} · GE 2565</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-end justify-between">
            <div className="text-3xl font-semibold tabular-nums">
              {progress.totalDone}
              <span className="text-lg text-muted-foreground"> / {progress.totalNeed} นก</span>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              เหลืออีก ~{remaining} นก จบ
            </div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs text-muted-foreground">{pct}%</div>
        </CardContent>
      </Card>

      {/* ── ธงต้องยืนยัน ── */}
      {verifyFlags.length > 0 && (
        <Alert>
          <AlertTitle>⚠️ จุดที่ควรยืนยันกับอาจารย์ที่ปรึกษา/SIS</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {verifyFlags.map((r) => (
                <li key={r.id}>
                  <span className="font-medium">{r.label}</span> — {r.verifyNote}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* ── การ์ดต่อหมวด ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {progress.categories.map((c) => {
          const cpct = c.needCredits ? Math.round((c.doneCredits / c.needCredits) * 100) : 0
          const status = c.doneCredits >= c.needCredits ? 'done' : c.doneCredits > 0 ? 'partial' : 'none'
          return (
            <Link key={c.category} href={`/requirements/${c.category}`}>
              <Card className="h-full transition-colors hover:border-foreground/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    {CATEGORY_LABEL[c.category]}
                    <StatusBadge status={status} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm tabular-nums text-muted-foreground">
                    {c.doneCredits} / {c.needCredits} นก
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${statusBarClass(status)}`} style={{ width: `${cpct}%` }} />
                  </div>
                  {c.missing.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      ขาด: {c.missing.slice(0, 3).map((m) => m.code).join(', ')}
                      {c.missing.length > 3 ? ` +${c.missing.length - 3}` : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* ── แนะนำเทอมหน้า ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📌 แนะนำลงเทอมหน้า (ปี {at.year} เทอม {at.term})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {next.recommended.length === 0 ? (
            <p className="text-sm text-muted-foreground">ไม่มีวิชาบังคับค้าง 🎉 — เลือกวิชาเลือก/เลือกเสรีตามสนใจ</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {next.recommended.map((x) => (
                <li key={x.code} className="flex items-center gap-2">
                  <span className="font-mono text-xs">{x.code}</span>
                  <span className="flex-1">{x.name}</span>
                  <span className="text-muted-foreground">{x.credits} นก</span>
                  <Badge variant="outline" className="text-xs">{x.reason}</Badge>
                </li>
              ))}
            </ul>
          )}
          {next.carryOver.length > 0 && (
            <div className="border-t pt-2 text-sm">
              <div className="mb-1 font-medium">ต้องจัดการ/ลงให้ครบ:</div>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {next.carryOver.map((x, i) => (
                  <li key={i}><span className="font-medium text-foreground">{x.name}</span> — {x.reason}</li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/plan" className="inline-block text-sm underline">ดูแผนเต็ม →</Link>
        </CardContent>
      </Card>
    </div>
  )
}
