'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { lookupCourse, allKnownCodes } from '@/lib/curriculum/lookup'
import type { TakenCourse } from '@/lib/types'

const GRADES = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'F', 'W', 'U', 'P', 'S', 'I']

interface Props {
  trigger: React.ReactElement
  initial?: TakenCourse
  title: string
  onSubmit: (c: TakenCourse) => Promise<void>
}

export function CourseFormDialog({ trigger, initial, title, onSubmit }: Props) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState(initial?.code ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [credits, setCredits] = useState(String(initial?.credits ?? ''))
  const [grade, setGrade] = useState(initial?.grade ?? 'A')
  const [term, setTerm] = useState(initial?.term ?? '')
  const [section, setSection] = useState(initial?.section ?? '')
  const [busy, setBusy] = useState(false)

  // auto-fill name/credits เมื่อพิมพ์รหัสที่รู้จัก
  useEffect(() => {
    const found = lookupCourse(code)
    if (found) {
      if (!initial) {
        setName((n) => (n ? n : found.name))
        setCredits((c) => (c ? c : String(found.credits)))
      }
    }
  }, [code, initial])

  async function submit() {
    setBusy(true)
    try {
      await onSubmit({
        id: initial?.id,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        credits: Number(credits) || 0,
        grade,
        term: term.trim(),
        section: section.trim() || undefined,
      })
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  const known = allKnownCodes()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>กรอกข้อมูลรายวิชา (พิมพ์รหัสที่รู้จักจะเติมชื่อ/หน่วยกิตให้)</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">รหัสวิชา</Label>
              <Input id="code" list="known-codes" value={code} onChange={(e) => setCode(e.target.value)} placeholder="346-321" />
              <datalist id="known-codes">
                {known.map((k) => <option key={k.code} value={k.code}>{k.name}</option>)}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="credits">หน่วยกิต</Label>
              <Input id="credits" type="number" min={0} value={credits} onChange={(e) => setCredits(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">ชื่อวิชา</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="term">เทอม</Label>
              <Input id="term" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="1/2569" />
            </div>
            <div className="space-y-1.5">
              <Label>เกรด</Label>
              <Select value={grade} onValueChange={(v) => setGrade(v ?? 'A')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="section">ตอน</Label>
              <Input id="section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="01" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={busy || !code || !term}>{busy ? 'กำลังบันทึก…' : 'บันทึก'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
