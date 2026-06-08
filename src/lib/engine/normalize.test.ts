import { describe, it, expect } from 'vitest'
import { normalizeCode } from './normalize'

describe('normalizeCode', () => {
  it('ตัดช่องว่างและทำเป็นพิมพ์ใหญ่', () => {
    expect(normalizeCode(' 890-102g1 ')).toBe('890-102G1')
    expect(normalizeCode('346-111')).toBe('346-111')
  })
})
