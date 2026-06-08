import type { TakenCourse } from '@/lib/types'

// บรรทัดรายวิชา SIS: "รหัส ชื่อวิชา ตอน หน่วยกิต ผลการเรียน"  เช่น 145-101 COMPANION ANIMALS 01 3 A
const COURSE_LINE = /^(\d{3}-\d{3}[A-Za-z0-9]*)\s+(.+?)\s+(\d{2})\s+(\d+(?:\.\d+)?)\s+([A-Za-z][+-]?)$/
// หัวเทอม: "ภาคการศึกษา 1/2567"
const TERM_HEADER = /ภาคการศึกษา\s*([1-3])\s*\/\s*(\d{4})/
const GRADES = new Set(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'F', 'W', 'U', 'P', 'S', 'I'])

function matchCourseLine(line: string, term: string): TakenCourse | null {
  const m = COURSE_LINE.exec(line)
  if (!m) return null
  const grade = m[5].toUpperCase()
  if (!GRADES.has(grade)) return null
  return {
    code: m[1].toUpperCase(),
    name: m[2].trim(),
    section: m[3],
    credits: Number(m[4]),
    grade,
    term,
  }
}

/** แยกข้อความ transcript แบบเทอมเดียว (ใส่ term เอง) */
export function parseTranscript(text: string, term: string): TakenCourse[] {
  const out: TakenCourse[] = []
  for (const raw of (text || '').split(/\r?\n/)) {
    const c = matchCourseLine(raw.trim().replace(/\s+/g, ' '), term)
    if (c) out.push(c)
  }
  return out
}

/**
 * แยกข้อความ transcript จาก SIS ที่มีหลายเทอม โดยตรวจหัว "ภาคการศึกษา X/YYYY"
 * แล้วผูกรายวิชาเข้าเทอมที่ถูกต้องอัตโนมัติ
 * @param fallbackTerm เทอมสำหรับบรรทัดที่อยู่ก่อนเจอหัวเทอมแรก (ถ้ามี)
 */
export function parseSisTranscript(text: string, fallbackTerm = ''): TakenCourse[] {
  const out: TakenCourse[] = []
  let currentTerm = fallbackTerm
  for (const raw of (text || '').split(/\r?\n/)) {
    const line = raw.trim().replace(/\s+/g, ' ')
    const th = TERM_HEADER.exec(line)
    if (th) {
      currentTerm = `${th[1]}/${th[2]}`
      continue
    }
    if (!currentTerm) continue
    const c = matchCourseLine(line, currentTerm)
    if (c) out.push(c)
  }
  return out
}
