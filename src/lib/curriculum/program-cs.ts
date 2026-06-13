import type { Program, Requirement, Category } from './types'
import { ALL_COURSES } from './catalog'
import { COURSES_CS } from './courses-cs'
import { GE_2565 } from './program-2564'

/** สร้าง fixed requirement จากรหัสวิชา (label/credits ดึงจากแคตตาล็อกรวม) */
function fixed(
  code: string,
  category: Category,
  rec?: { year?: number; term?: number },
): Requirement {
  const info = ALL_COURSES[code]
  return {
    kind: 'fixed',
    id: `fixed:${code}`,
    category,
    label: info?.name ?? code,
    courseCodes: [code],
    credits: info?.credits ?? 0,
    recYear: rec?.year,
    recTerm: rec?.term,
  }
}

// ── กลุ่มแกนด้านวิทยาศาสตร์ คณิตศาสตร์ และเทคโนโลยี (12) ──
const FOUNDATION_CS: Requirement[] = [
  fixed('315-101', 'foundation', { year: 1, term: 1 }),
  fixed('322-101', 'foundation', { year: 1, term: 1 }),
  fixed('345-101', 'foundation', { year: 1, term: 1 }),
  fixed('346-101', 'foundation', { year: 1, term: 2 }),
]

// ── วิชาเอกบังคับ (56) — [รหัส, ปี, เทอม] ตามแผนการศึกษา ──
const CORE_TABLE: [string, number, number][] = [
  ['344-101', 1, 1], ['344-111', 1, 1], ['344-181', 1, 1],
  ['344-141', 1, 2], ['344-182', 1, 2], ['344-281', 1, 2],
  ['344-201', 2, 1], ['344-211', 2, 1], ['344-221', 2, 1], ['344-231', 2, 1],
  ['344-212', 2, 2], ['344-213', 2, 2], ['344-222', 2, 2], ['344-232', 2, 2], ['344-251', 2, 2],
  ['344-301', 3, 1], ['344-321', 3, 1], ['344-341', 3, 1], ['344-361', 3, 1],
  ['344-391', 3, 2],
  ['344-491', 4, 1],
  ['344-492', 4, 2],
]
const CORE_CS: Requirement[] = CORE_TABLE.map(([code, year, term]) =>
  fixed(code, 'core', { year, term }),
)

// รหัสที่ไม่ใช่วิชาเอกเลือก (แกน + บังคับ + เตรียมสหกิจ S) — ที่เหลือใน COURSES_CS คือวิชาเอกเลือกทั้งหมด
const NON_ELECTIVE = new Set<string>([
  '315-101', '345-101', '346-101',
  ...CORE_TABLE.map(([c]) => c),
  '344-494', // เตรียมสหกิจศึกษา (ไม่นับหน่วยกิต, ต้องได้ S) — ไม่ใช่วิชาเลือก
])

/** รหัสวิชาเอกเลือก วท.คอม ทั้งหมด (3 ด้าน + หัวข้อพิเศษ + ฝึกงาน) สำหรับ bucket eligibility */
export const CS_MAJOR_ELEC_CODES = new Set(
  Object.keys(COURSES_CS).filter((c) => !NON_ELECTIVE.has(c)),
)

// ── วิชาเอกเลือก (27) ──
const MAJOR_ELEC_CS: Requirement = {
  kind: 'bucket',
  id: 'cs_major_elec',
  category: 'major_elective',
  label: 'วิชาเอกเลือก (27 นก)',
  needCredits: 27,
  eligible: 'cs_major_elec',
  recYear: 2,
  recTerm: 2,
  verifyNote:
    'ต้องเลือกวิชาในด้านความเชี่ยวชาญด้านใดด้านหนึ่ง (พัฒนาซอฟต์แวร์ / อินเทอร์เน็ตและความมั่นคงปลอดภัยไซเบอร์ / AI และวิทยาการข้อมูล) ไม่น้อยกว่า 12 นก ส่วนที่เหลือเลือกจากด้านใดก็ได้ — ระบบนับรวมหน่วยกิตเท่านั้น ยังไม่ตรวจกฎ 12 นก/ด้าน โปรดยืนยันกับอาจารย์ที่ปรึกษา',
}

// ── วิชาเลือกเสรี (6) ──
const FREE_CS: Requirement = {
  kind: 'bucket',
  id: 'free',
  category: 'free_elective',
  label: 'วิชาเลือกเสรี (6)',
  needCredits: 6,
  eligible: 'free',
  recYear: 4,
  recTerm: 1,
  verifyNote: 'อาจดึงจากวิชาส่วนเกินหมวดอื่นได้ — ยืนยันกับอาจารย์ที่ปรึกษา',
}

/**
 * หลักสูตร วท.บ. วิทยาการคอมพิวเตอร์ (ปรับปรุง พ.ศ. 2569) — รวม 125 นก
 * โครงสร้าง: GE 24 (กรอบ GE2565 ร่วมกับสถิติ) + แกนวิทย์-คณิต-เทคโนฯ 12 + เอกบังคับ 56 + เอกเลือก 27 + เสรี 6
 * เป็นหลักสูตรสหกิจศึกษา (CWIE) — มี 344-491 โครงงาน + 344-492 สหกิจ + 344-494 เตรียมสหกิจ (S)
 */
export function buildCompSciProgram(): Program {
  const requirements: Requirement[] = [
    ...FOUNDATION_CS,
    ...CORE_CS,
    MAJOR_ELEC_CS,
    ...GE_2565,
    FREE_CS,
  ]
  return {
    id: 'cs2569-coop-ge2565',
    plan: 'coop',
    geFramework: 'ge2565',
    totalCredits: 125,
    requirements,
  }
}
