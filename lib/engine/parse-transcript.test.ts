import { describe, it, expect } from 'vitest'
import { parseTranscript } from './parse-transcript'

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
