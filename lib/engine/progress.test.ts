import { describe, it, expect } from 'vitest'
import { buildProgram } from '@/lib/curriculum/program-2564'
import { SEED_6710210764 } from '@/lib/curriculum/seed-6710210764'
import { computeProgress, suggestNextTerm } from './progress'

describe('computeProgress (เคสจริง 6710210764, regular + ge2565)', () => {
  const prog = buildProgram('regular', 'ge2565')
  const r = computeProgress(prog, SEED_6710210764, [])
  const cat = (c: string) => r.categories.find((x) => x.category === c)!
  const req = (id: string) => r.requirements.find((x) => x.id === id)!

  it('วิทย์พื้นฐาน 21/24 และขาด 346-361', () => {
    expect(cat('foundation').doneCredits).toBe(21)
    expect(cat('foundation').needCredits).toBe(24)
    expect(cat('foundation').missing.map((m) => m.code)).toContain('346-361')
  })

  it('วิชาบังคับ 26/57', () => {
    expect(cat('core').doneCredits).toBe(26)
    expect(cat('core').needCredits).toBe(57)
  })

  it('วิชาเลือกสาขา 0/21 (346-343 ติด W ไม่นับ)', () => {
    expect(cat('major_elective').doneCredits).toBe(0)
    expect(cat('major_elective').needCredits).toBe(21)
  })

  it('GE: GE1/GE2B/GE4/GE6/GE7 ผ่าน, GE2A ยังไม่ผ่าน (473-001G2A=E)', () => {
    expect(req('ge:GE1').status).toBe('done')
    expect(req('ge:GE2B').status).toBe('done')
    expect(req('ge:GE4').status).toBe('done')
    expect(req('ge:GE6').status).toBe('done')
    expect(req('ge:GE7').status).toBe('done')
    expect(req('ge:GE2A').status).not.toBe('done')
  })

  it('GE3/GE5 มี verifyNote (ลงรหัสเก่า 1 นก)', () => {
    expect(req('ge:GE3').verifyNote).toBeTruthy()
    expect(req('ge:GE5').verifyNote).toBeTruthy()
  })

  it('ไม่นับวิชาซ้ำซ้อน และ totalDone อยู่ในช่วงที่สมเหตุผล', () => {
    expect(r.totalDone).toBeGreaterThan(0)
    expect(r.totalDone).toBeLessThanOrEqual(r.program.totalCredits)
  })
})

describe('computeProgress (coop)', () => {
  it('แผนสหกิจ: เลือกสาขา need = 17, รวม 132', () => {
    const prog = buildProgram('coop', 'ge2565')
    const r = computeProgress(prog, SEED_6710210764, [])
    expect(r.categories.find((c) => c.category === 'major_elective')!.needCredits).toBe(17)
    expect(r.program.totalCredits).toBe(132)
  })
})

describe('suggestNextTerm', () => {
  it('แนะนำวิชาปี3เทอม1 ที่ยังไม่ผ่าน (รวม 346-321/346-322/346-331/346-361)', () => {
    const prog = buildProgram('regular', 'ge2565')
    const s = suggestNextTerm(prog, SEED_6710210764, [], { year: 3, term: 1 })
    const codes = s.recommended.map((x) => x.code)
    for (const c of ['346-321', '346-322', '346-331', '346-361']) expect(codes).toContain(c)
  })
})
