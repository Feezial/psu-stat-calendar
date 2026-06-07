'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseTranscript } from '@/lib/engine/parse-transcript'
import type { TakenCourse } from '@/lib/types'
import { GradeBadge } from '../../_components/status'

export function PasteDialog({ onImport }: { onImport: (rows: TakenCourse[]) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const parsed = term.trim() ? parseTranscript(text, term.trim()) : []

  async function confirm() {
    setBusy(true)
    try {
      await onImport(parsed)
      setOpen(false)
      setText('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">วางจาก SIS</Button>} />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>วางข้อความ transcript จาก SIS</DialogTitle>
          <DialogDescription>คัดลอกตารางผลการเรียนของเทอมหนึ่ง แล้ววางที่นี่ ระบบจะแยกรหัส/เกรดให้</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pterm">เทอมของข้อมูลนี้</Label>
            <Input id="pterm" className="w-40" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="1/2569" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ptext">ข้อความ</Label>
            <textarea id="ptext" value={text} onChange={(e) => setText(e.target.value)} rows={8}
              className="w-full rounded-md border bg-transparent px-3 py-2 font-mono text-xs"
              placeholder={'346-321 MATHEMATICAL STATISTICS II 01 3 B\n346-322 SAMPLING TECHNIQUES 01 3 C'} />
          </div>
          {parsed.length > 0 && (
            <div className="max-h-48 overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr><th className="p-2 text-left">รหัส</th><th className="p-2 text-left">ชื่อ</th><th className="p-2">นก</th><th className="p-2">เกรด</th></tr>
                </thead>
                <tbody>
                  {parsed.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 font-mono text-xs">{r.code}</td>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2 text-center tabular-nums">{r.credits}</td>
                      <td className="p-2 text-center"><GradeBadge grade={r.grade} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {term.trim() && text.trim() && parsed.length === 0 && (
            <p className="text-sm text-rose-600">แยกข้อมูลไม่ได้ — ตรวจรูปแบบ &quot;รหัส ชื่อ ตอน หน่วยกิต เกรด&quot;</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={confirm} disabled={busy || parsed.length === 0}>
            {busy ? 'กำลังนำเข้า…' : `นำเข้า ${parsed.length} วิชา`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
