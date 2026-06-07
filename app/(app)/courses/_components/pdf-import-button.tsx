'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { parseSisTranscript } from '@/lib/engine/parse-transcript'
import { extractPdfText } from '@/lib/engine/pdf-extract'
import type { TakenCourse } from '@/lib/types'
import { ImportPreview } from './import-preview'
import { toast } from 'sonner'
import { FileUp, Loader2 } from 'lucide-react'

// คลาสปุ่มสไตล์ outline (label ทำเป็นปุ่มเอง — กดแล้วเปิด file chooser ได้โดยไม่ชน dialog)
const BTN =
  'inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-input bg-transparent px-3 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 data-disabled:pointer-events-none data-disabled:opacity-50'

export function PdfImportButton({ onImport }: { onImport: (rows: TakenCourse[]) => Promise<void> }) {
  const [rows, setRows] = useState<TakenCourse[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [extracting, setExtracting] = useState(false)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // เลือกไฟล์เดิมซ้ำได้
    if (!file) return
    setExtracting(true)
    try {
      const txt = await extractPdfText(await file.arrayBuffer())
      const parsed = parseSisTranscript(txt)
      if (parsed.length === 0) {
        toast.warning('อ่าน PDF ได้ แต่ยังแยกวิชาไม่ได้ — ลองใช้ "วางข้อความ" แทน')
        return
      }
      setRows(parsed)
      setOpen(true)
    } catch (err) {
      toast.error('อ่าน PDF ไม่สำเร็จ: ' + (err instanceof Error ? err.message : 'unknown'))
    } finally {
      setExtracting(false)
    }
  }

  async function confirm() {
    setBusy(true)
    try {
      await onImport(rows)
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <label className={BTN} data-disabled={extracting || undefined}>
        {extracting ? (
          <><Loader2 className="size-4 animate-spin" /> กำลังอ่าน PDF…</>
        ) : (
          <><FileUp className="size-4" /> นำเข้า PDF</>
        )}
        <input type="file" accept="application/pdf,.pdf" className="sr-only"
          aria-label="เลือกไฟล์ PDF จาก SIS" onChange={onPick} disabled={extracting} />
      </label>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ตรวจสอบก่อนนำเข้า (จาก PDF)</DialogTitle>
            <DialogDescription>พบ {rows.length} วิชาจากไฟล์ PDF — ตรวจความถูกต้องแล้วกดนำเข้า</DialogDescription>
          </DialogHeader>
          <ImportPreview rows={rows} />
          <DialogFooter>
            <Button onClick={confirm} disabled={busy || rows.length === 0}>
              {busy ? 'กำลังนำเข้า…' : `นำเข้า ${rows.length} วิชา`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
