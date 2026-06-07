import type { TakenCourse } from '@/lib/types'

// รูปแบบบรรทัด SIS: "รหัส ชื่อวิชา ตอน หน่วยกิต เกรด"
// เช่น: 145-101 COMPANION ANIMALS 01 3 A
const LINE = /^(\d{3}-\d{3}[A-Za-z0-9]*)\s+(.+?)\s+(\d{2})\s+(\d+(?:\.\d+)?)\s+([A-Za-z][+-]?)$/
const GRADES = new Set(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'F', 'W', 'U', 'P', 'S', 'I'])

/** แยกข้อความ transcript จาก SIS เป็นรายวิชา (ข้ามหัวตาราง/บรรทัดสรุป) */
export function parseTranscript(text: string, term: string): TakenCourse[] {
  const out: TakenCourse[] = []
  for (const raw of (text || '').split(/\r?\n/)) {
    const line = raw.trim().replace(/\s+/g, ' ')
    const m = LINE.exec(line)
    if (!m) continue
    const grade = m[5].toUpperCase()
    if (!GRADES.has(grade)) continue
    out.push({
      code: m[1].toUpperCase(),
      name: m[2].trim(),
      section: m[3],
      credits: Number(m[4]),
      grade,
      term,
    })
  }
  return out
}
