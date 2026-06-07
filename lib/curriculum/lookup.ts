import { COURSES } from './courses'
import { GE_BY_CODE } from './ge-catalog'
import { normalizeCode } from '@/lib/engine/normalize'

export interface Lookup {
  code: string
  name: string
  credits: number
}

/** ค้นรายวิชาจาก master list (วิชาเฉพาะ) หรือแคตตาล็อก GE */
export function lookupCourse(code: string): Lookup | null {
  const c = normalizeCode(code)
  const info = COURSES[c] ?? GE_BY_CODE[c]
  if (!info) return null
  return { code: c, name: info.name, credits: info.credits }
}

/** รายการรหัสทั้งหมดที่รู้จัก (สำหรับ datalist autocomplete) */
export function allKnownCodes(): Lookup[] {
  const out: Lookup[] = []
  for (const k of Object.keys(COURSES)) out.push({ code: k, name: COURSES[k].name, credits: COURSES[k].credits })
  for (const k of Object.keys(GE_BY_CODE)) out.push({ code: k, name: GE_BY_CODE[k].name, credits: GE_BY_CODE[k].credits })
  return out
}
