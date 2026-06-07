import { describe, it, expect } from 'vitest'
import { parseTranscript, parseSisTranscript } from './parse-transcript'

const sample = `รหัสวิชา ชื่อวิชา ตอน หน่วยกิต ผลการเรียน
145-101 COMPANION ANIMALS 01 3 A
322-101 CALCULUS I 03 3 D
890-101G1 ESSENTIAL ENGLISH 16 2 U
สรุประดับภาคการศึกษา (Semester)`

describe('parseTranscript', () => {
  it('แยกรหัส/ชื่อ/ตอน/หน่วยกิต/เกรด และข้ามหัว/ท้ายตาราง', () => {
    const rows = parseTranscript(sample, '1/2567')
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({
      code: '145-101', name: 'COMPANION ANIMALS', section: '01', credits: 3, grade: 'A', term: '1/2567',
    })
    expect(rows[2]).toMatchObject({ code: '890-101G1', credits: 2, grade: 'U' })
  })
})

const multiTerm = `ผลการเรียน
นายลฏุฟี บินมะสาและ รหัสนักศึกษา 6710210764
ภาคการศึกษา 1/2567
รหัสวิชา ชื่อวิชา ตอน หน่วยกิต ผลการเรียน
145-101 COMPANION ANIMALS 01 3 A
322-101 CALCULUS I 03 3 D
สรุประดับภาคการศึกษา (Semester)
หน่วยกิตที่ลงทะเบียน 21
ภาคการศึกษา 2/2567
193-031G8 NATURAL THERAPY 04 2 B+
322-102 CALCULUS II 01 3 W
890-102G1 EVERYDAY ENGLISH 13 2 E
ภาคการศึกษา 3/2567
322-102 CALCULUS II 02 3 D`

describe('parseSisTranscript (หลายเทอมอัตโนมัติ)', () => {
  it('ผูกรายวิชาเข้าเทอมที่ถูกต้องตามหัว "ภาคการศึกษา"', () => {
    const rows = parseSisTranscript(multiTerm)
    expect(rows).toHaveLength(6)
    const byCodeTerm = (code: string) => rows.find((r) => r.code === code)!
    expect(byCodeTerm('145-101').term).toBe('1/2567')
    expect(byCodeTerm('193-031G8').term).toBe('2/2567')
    // 322-102 มี 2 ครั้ง (2/2567 W และ 3/2567 D)
    const calc2 = rows.filter((r) => r.code === '322-102')
    expect(calc2.map((r) => r.term).sort()).toEqual(['2/2567', '3/2567'])
    expect(calc2.find((r) => r.term === '3/2567')!.grade).toBe('D')
  })
  it('ข้ามบรรทัดก่อนเจอหัวเทอมแรก และข้ามบรรทัดสรุป', () => {
    const rows = parseSisTranscript(multiTerm)
    expect(rows.every((r) => r.term)).toBe(true)
  })
})
