'use client'

import { useRef, useState } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { parseSisTranscript } from '@/lib/engine/parse-transcript'
import type { TakenCourse } from '@/lib/types'
import { ImportPreview } from '@/components/(App)/import-preview'
import { toast } from 'sonner'
import { FileUp, Loader2 } from 'lucide-react'

export function PdfImportButton({ onImport }: { onImport: (rows: TakenCourse[]) => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null)
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
      // แกะ PDF ฝั่ง server (ทำงานได้ทุกอุปกรณ์/เบราว์เซอร์ — ไม่มี pdf.js/worker ฝั่ง browser)
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: file })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      const parsed = parseSisTranscript(data.text ?? '')
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
      {/* hidden input — สั่งเปิดด้วย ref จากปุ่ม (เชื่อถือได้กว่า label) */}
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden"
        aria-hidden="true" tabIndex={-1} onChange={onPick} />
      <Button variant="outline" disabled={extracting} onClick={() => inputRef.current?.click()}>
        {extracting ? (
          <><Loader2 className="size-4 animate-spin" /> กำลังอ่าน PDF…</>
        ) : (
          <><FileUp className="size-4" /> นำเข้า PDF</>
        )}
      </Button>

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
