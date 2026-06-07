'use client'

import type { TakenCourse } from '@/lib/types'
import { GradeBadge } from '../../_components/status'

export function ImportPreview({ rows }: { rows: TakenCourse[] }) {
  if (rows.length === 0) return null
  const terms = [...new Set(rows.map((r) => r.term))]
  return (
    <div className="max-h-60 overflow-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted/80 text-xs text-muted-foreground">
          <tr>
            <th className="p-2 text-left">เทอม</th>
            <th className="p-2 text-left">รหัส</th>
            <th className="p-2 text-left">ชื่อ</th>
            <th className="p-2">นก</th>
            <th className="p-2">เกรด</th>
          </tr>
        </thead>
        <tbody>
          {terms.map((t) =>
            rows.filter((r) => r.term === t).map((r, i) => (
              <tr key={`${t}-${r.code}-${i}`} className="border-t">
                <td className="p-2 text-xs text-muted-foreground">{r.term}</td>
                <td className="p-2 font-mono text-xs">{r.code}</td>
                <td className="p-2">{r.name}</td>
                <td className="p-2 text-center tabular-nums">{r.credits}</td>
                <td className="p-2 text-center"><GradeBadge grade={r.grade} /></td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  )
}
