'use client'

import { useState } from 'react'
import { useAppData } from '../_components/app-data'
import { CourseFormDialog } from './_components/course-form-dialog'
import { PasteDialog } from './_components/paste-dialog'
import { PdfImportButton } from './_components/pdf-import-button'
import { GradeBadge } from '../_components/status'
import {
  addTaken, updateTaken, deleteTaken, bulkAddTaken,
} from '@/lib/data/repository'
import { SEED_6710210764 } from '@/lib/curriculum/seed-6710210764'
import { termKey } from '@/lib/engine/grades'
import type { TakenCourse } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function CoursesPage() {
  const { taken, refresh } = useAppData()
  const [busy, setBusy] = useState(false)

  const terms = [...new Set(taken.map((t) => t.term))].sort((a, b) => termKey(b) - termKey(a))

  async function handleAdd(c: TakenCourse) {
    await addTaken(c)
    await refresh()
    toast.success('เพิ่มรายวิชาแล้ว')
  }
  async function handleEdit(c: TakenCourse) {
    if (!c.id) return
    await updateTaken(c.id, c)
    await refresh()
    toast.success('แก้ไขแล้ว')
  }
  async function handleDelete(id?: string) {
    if (!id) return
    await deleteTaken(id)
    await refresh()
    toast.success('ลบแล้ว')
  }
  async function handleImport(rows: TakenCourse[]) {
    await bulkAddTaken(rows)
    await refresh()
    toast.success(`นำเข้า ${rows.length} วิชาแล้ว`)
  }
  async function loadSeed() {
    setBusy(true)
    try {
      await bulkAddTaken(SEED_6710210764)
      await refresh()
      toast.success('โหลดข้อมูลตัวอย่างแล้ว')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ผิดพลาด')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-lg font-semibold">รายวิชาที่เรียนแล้ว ({taken.length})</h1>
        <CourseFormDialog title="เพิ่มรายวิชา" trigger={<Button><Plus className="size-4" /> เพิ่มรายวิชา</Button>} onSubmit={handleAdd} />
        <PdfImportButton onImport={handleImport} />
        <PasteDialog onImport={handleImport} />
        {taken.length === 0 && (
          <Button variant="secondary" onClick={loadSeed} disabled={busy}>
            โหลดข้อมูลตัวอย่าง (6710210764)
          </Button>
        )}
      </div>

      {taken.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            ยังไม่มีข้อมูล — กด &quot;นำเข้า PDF&quot; (อัปโหลดไฟล์จาก SIS), &quot;วางข้อความ&quot; หรือ &quot;โหลดข้อมูลตัวอย่าง&quot;
          </CardContent>
        </Card>
      ) : (
        terms.map((term) => (
          <Card key={term}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ภาคการศึกษา {term}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {taken.filter((t) => t.term === term).map((t) => (
                    <tr key={t.id ?? `${t.code}-${t.term}`} className="border-t">
                      <td className="py-2 pl-4 pr-2 font-mono text-xs">{t.code}</td>
                      <td className="px-2 py-2">{t.name}</td>
                      <td className="px-2 py-2 text-center tabular-nums text-muted-foreground">{t.credits}</td>
                      <td className="px-2 py-2 text-center"><GradeBadge grade={t.grade} /></td>
                      <td className="py-2 pl-2 pr-4 text-right">
                        <CourseFormDialog title="แก้ไขรายวิชา" initial={t} onSubmit={handleEdit}
                          trigger={<Button variant="ghost" size="icon-sm" aria-label="แก้ไข"><Pencil className="size-4" /></Button>} />
                        <Button variant="ghost" size="icon-sm" aria-label="ลบ" className="text-rose-600 hover:text-rose-700" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
