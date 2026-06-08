import { describe, it, expect } from 'vitest'
import { GE_CATALOG } from './ge-catalog'
import official from './ge-official.json'

// ge-official.json = ข้อมูลทางการที่ scrape จาก 2 Google Sheets ของ ม.อ.หาดใหญ่ (ทุก tab)
// scripts: scrape/dump.py + scrape/parse.py — รันใหม่ได้ถ้าชีทอัปเดต
describe('GE_CATALOG ตรงกับข้อมูลทางการ (scrape 2 ชีท Hatyai)', () => {
  const byCode = new Map(GE_CATALOG.map((c) => [c.code, c.group]))

  it('catalog ครอบคลุมทุกวิชาในชีททางการ และ group ถูกต้อง', () => {
    const missing: string[] = []
    const wrongGroup: string[] = []
    for (const [code, group] of Object.entries(official)) {
      if (!byCode.has(code)) missing.push(`${code} (${group})`)
      else if (byCode.get(code) !== group)
        wrongGroup.push(`${code}: catalog=${byCode.get(code)} official=${group}`)
    }
    expect({ missing, wrongGroup }).toEqual({ missing: [], wrongGroup: [] })
  })

  it('catalog ไม่มีรหัสซ้ำ', () => {
    const codes = GE_CATALOG.map((c) => c.code)
    expect(codes.length).toBe(new Set(codes).size)
  })

  it('2 วิชาที่ scrape เจอเพิ่ม (388-121G2B, 388-122G2A) อยู่ใน catalog', () => {
    expect(byCode.get('388-121G2B')).toBe('GE2B')
    expect(byCode.get('388-122G2A')).toBe('GE2A')
  })
})
