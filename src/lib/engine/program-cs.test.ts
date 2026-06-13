import { describe, it, expect } from 'vitest'
import { buildCompSciProgram, CS_MAJOR_ELEC_CODES } from '@/lib/curriculum/program-cs'
import { computeProgress } from './progress'
import type { TakenCourse } from '@/lib/types'

describe('หลักสูตรวิทยาการคอมพิวเตอร์ 2569 — แผนสหกิจ (coop)', () => {
  const prog = buildCompSciProgram('coop')
  const r = computeProgress(prog, [], [])
  const need = (c: string) => r.categories.find((x) => x.category === c)!.needCredits

  it('รวม 125 หน่วยกิต และเป็นแผนสหกิจ + GE2565', () => {
    expect(prog.totalCredits).toBe(125)
    expect(prog.plan).toBe('coop')
    expect(prog.geFramework).toBe('ge2565')
  })

  it('หน่วยกิตแต่ละหมวด: แกน 12 / บังคับ 56 / เอกเลือก 27 / GE 24 / เสรี 6', () => {
    expect(need('foundation')).toBe(12)
    expect(need('core')).toBe(56)
    expect(need('major_elective')).toBe(27)
    expect(need('ge')).toBe(24)
    expect(need('free_elective')).toBe(6)
  })

  it('ผลรวม needCredits ทุกหมวด = totalCredits', () => {
    const sum = r.categories.reduce((s, c) => s + c.needCredits, 0)
    expect(sum).toBe(125)
  })

  it('มี 344-492 สหกิจศึกษา + 344-491 โครงงาน + GE8 bucket', () => {
    expect(prog.requirements.find((x) => x.id === 'fixed:344-492')).toBeTruthy()
    expect(prog.requirements.find((x) => x.id === 'fixed:344-491')).toBeTruthy()
    expect(prog.requirements.find((x) => x.id === 'ge:GE8')).toBeTruthy()
  })
})

describe('หลักสูตรวิทยาการคอมพิวเตอร์ 2569 — แผนปกติ (regular)', () => {
  const prog = buildCompSciProgram('regular')
  const r = computeProgress(prog, [], [])
  const need = (c: string) => r.categories.find((x) => x.category === c)!.needCredits

  it('รวม 125 หน่วยกิต และเป็นแผนปกติ', () => {
    expect(prog.totalCredits).toBe(125)
    expect(prog.plan).toBe('regular')
  })

  it('ปกติ: บังคับ 50 (ตัดสหกิจ 6) / เอกเลือก 33 (เพิ่ม 6) — หมวดอื่นเท่าเดิม', () => {
    expect(need('foundation')).toBe(12)
    expect(need('core')).toBe(50)
    expect(need('major_elective')).toBe(33)
    expect(need('ge')).toBe(24)
    expect(need('free_elective')).toBe(6)
    expect(r.categories.reduce((s, c) => s + c.needCredits, 0)).toBe(125)
  })

  it('ไม่มี 344-492 สหกิจศึกษา แต่ยังมี 344-491 โครงงาน', () => {
    expect(prog.requirements.find((x) => x.id === 'fixed:344-492')).toBeFalsy()
    expect(prog.requirements.find((x) => x.id === 'fixed:344-491')).toBeTruthy()
  })
})

describe('CS_MAJOR_ELEC_CODES (เซตวิชาเอกเลือก)', () => {
  it('รวมวิชาเลือกทั้ง 3 ด้าน แต่ไม่รวมวิชาบังคับ/แกน/เตรียมสหกิจ', () => {
    expect(CS_MAJOR_ELEC_CODES.has('344-362')).toBe(true) // ML (AI/Data)
    expect(CS_MAJOR_ELEC_CODES.has('344-214')).toBe(true) // Frontend (Software)
    expect(CS_MAJOR_ELEC_CODES.has('344-224')).toBe(true) // Network Security
    expect(CS_MAJOR_ELEC_CODES.has('344-211')).toBe(false) // บังคับ
    expect(CS_MAJOR_ELEC_CODES.has('345-101')).toBe(false) // แกน
    expect(CS_MAJOR_ELEC_CODES.has('344-494')).toBe(false) // เตรียมสหกิจ (S)
  })
})

describe('CS — การจับคู่รายวิชาที่เรียนแล้ว', () => {
  const prog = buildCompSciProgram()
  const taken: TakenCourse[] = [
    { code: '315-101', name: '', credits: 3, grade: 'A', term: '1/2569' }, // แกน
    { code: '344-101', name: '', credits: 2, grade: 'B+', term: '1/2569' }, // บังคับ
    { code: '344-362', name: '', credits: 3, grade: 'A', term: '2/2570' }, // เอกเลือก
    { code: '344-214', name: '', credits: 3, grade: 'B', term: '2/2570' }, // เอกเลือก
    { code: '344-494', name: '', credits: 1, grade: 'S', term: '1/2572' }, // เตรียมสหกิจ → extra
  ]
  const r = computeProgress(prog, taken, [])
  const cat = (c: string) => r.categories.find((x) => x.category === c)!

  it('แกน 3, บังคับ 2, เอกเลือก 6 (344-362 + 344-214)', () => {
    expect(cat('foundation').doneCredits).toBe(3)
    expect(cat('core').doneCredits).toBe(2)
    expect(cat('major_elective').doneCredits).toBe(6)
  })

  it('344-494 (เตรียมสหกิจ) ไม่ถูกนับเป็นวิชาบังคับ/แกน/เอกเลือก', () => {
    for (const c of ['foundation', 'core', 'major_elective']) {
      const codes = r.requirements
        .filter((x) => x.category === c)
        .flatMap((x) => x.matched.map((t) => t.code))
      expect(codes).not.toContain('344-494')
    }
  })
})
