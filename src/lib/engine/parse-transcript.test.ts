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

describe('parseSisTranscript — รองรับรูปแบบที่หลากหลายขึ้น (regression "แยกวิชาไม่ได้")', () => {
  it('หัวเทอม "ภาคการศึกษาที่ 1/2567" (มีคำว่า "ที่")', () => {
    const r = parseSisTranscript('ภาคการศึกษาที่ 1/2567\n346-111 PRINCIPLES OF STATISTICS 01 3 A')
    expect(r).toHaveLength(1)
    expect(r[0]).toMatchObject({ code: '346-111', term: '1/2567', grade: 'A' })
  })
  it('หัวเทอม "ภาคเรียนที่ 2/2567"', () => {
    const r = parseSisTranscript('ภาคเรียนที่ 2/2567\n322-102 CALCULUS II 01 3 B')
    expect(r[0]).toMatchObject({ term: '2/2567', grade: 'B' })
  })
  it('หน่วยกิตแบบ 3(3-0-6) + คอลัมน์แต้มเฉลี่ยต่อท้าย', () => {
    const r = parseSisTranscript('ภาคการศึกษาที่ 2/2567\n322-102 CALCULUS II 01 3(3-0-6) B+ 3.50')
    expect(r[0]).toMatchObject({ code: '322-102', credits: 3, grade: 'B+', section: '01' })
  })
  it('ไม่มีคอลัมน์ตอน', () => {
    const r = parseTranscript('145-101 COMPANION ANIMALS 3 A', '1/2567')
    expect(r[0]).toMatchObject({ code: '145-101', name: 'COMPANION ANIMALS', credits: 3, grade: 'A', section: '' })
  })
  it('ภาคฤดูร้อน = เทอม 3', () => {
    const r = parseSisTranscript('ภาคฤดูร้อน/2567\n322-102 CALCULUS II 02 3 D')
    expect(r[0]).toMatchObject({ code: '322-102', term: '3/2567', grade: 'D' })
  })
  it('ชื่อวิชาภาษาไทยที่มีตัวเลขนำ', () => {
    const r = parseTranscript('950-103G5 24 บอดี&มายด์ 01 2 B', '1/2567')
    expect(r[0]).toMatchObject({ code: '950-103G5', name: '24 บอดี&มายด์', credits: 2, grade: 'B' })
  })
  it('ดึงวิชาได้แม้ไม่เจอหัวเทอม (term ว่าง — ดีกว่าได้ 0)', () => {
    const r = parseSisTranscript('346-111 PRINCIPLES OF STATISTICS 01 3 A')
    expect(r).toHaveLength(1)
    expect(r[0].code).toBe('346-111')
  })
})
