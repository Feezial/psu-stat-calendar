import type { Program, Requirement, Plan, GeFramework, Category } from './types'
import { COURSES } from './courses'

/** สร้าง fixed requirement จากรหัสวิชา (label/credits ดึงจาก COURSES) */
function fixed(
  code: string,
  category: Category,
  rec?: { year?: number; term?: number },
  extra?: { prereq?: string[]; verifyNote?: string },
): Requirement {
  const info = COURSES[code]
  return {
    kind: 'fixed',
    id: `fixed:${code}`,
    category,
    label: info?.name ?? code,
    courseCodes: [code],
    credits: info?.credits ?? 0,
    recYear: rec?.year,
    recTerm: rec?.term,
    prereq: extra?.prereq,
    verifyNote: extra?.verifyNote,
  }
}

// ── 2.1 วิทย์พื้นฐาน 24 (รหัส, ปี, เทอม ตามแผนการเรียน) ──
const FOUNDATION: Requirement[] = [
  fixed('322-101', 'foundation', { year: 1, term: 1 }),
  fixed('324-101', 'foundation', { year: 1, term: 1 }),
  fixed('325-101', 'foundation', { year: 1, term: 1 }),
  fixed('330-101', 'foundation', { year: 1, term: 1 }),
  fixed('331-101', 'foundation', { year: 1, term: 1 }),
  fixed('332-101', 'foundation', { year: 1, term: 1 }),
  fixed('333-101', 'foundation', { year: 1, term: 1 }),
  fixed('322-102', 'foundation', { year: 1, term: 2 }),
  fixed('346-111', 'foundation', { year: 1, term: 2 }),
  fixed('346-361', 'foundation', { year: 3, term: 1 }),
]

// ── 2.2 บังคับ (ร่วมทั้งสองแผน) ──
const CORE_COMMON: Requirement[] = [
  fixed('346-161', 'core', { year: 1, term: 2 }),
  fixed('346-221', 'core', { year: 2, term: 1 }),
  fixed('346-222', 'core', { year: 2, term: 1 }),
  fixed('346-231', 'core', { year: 2, term: 1 }),
  fixed('346-223', 'core', { year: 2, term: 2 }),
  fixed('346-232', 'core', { year: 2, term: 2 }),
  fixed('346-241', 'core', { year: 2, term: 2 }),
  fixed('346-261', 'core', { year: 2, term: 2 }),
  fixed('346-321', 'core', { year: 3, term: 1 }),
  fixed('346-322', 'core', { year: 3, term: 1 }),
  fixed('346-331', 'core', { year: 3, term: 1 }),
  fixed('346-332', 'core', { year: 3, term: 2 }),
  fixed('346-333', 'core', { year: 3, term: 2 }),
  fixed('346-334', 'core', { year: 3, term: 2 }),
  fixed('346-351', 'core', { year: 3, term: 2 }),
  fixed('346-451', 'core', { year: 3, term: 2 }),
  fixed('346-441', 'core', { year: 4, term: 1 }),
  fixed('346-471', 'core', { year: 4, term: 1 }),
  fixed('346-491', 'core', { year: 4, term: 1 }),
]

function coreFor(plan: Plan): Requirement[] {
  return plan === 'coop'
    ? [...CORE_COMMON, fixed('346-472', 'core', { year: 4, term: 2 })]
    : [...CORE_COMMON, fixed('346-492', 'core', { year: 4, term: 2 })]
}

// ── 2.3 วิชาเลือกสาขา ──
export const MAJOR_G1_CODES = new Set([
  '346-335', '346-336', '346-341', '346-342', '346-343', '346-344', '346-371',
  '346-431', '346-432', '346-442', '346-443', '346-444', '346-445', '346-481', '346-482',
  '322-201', '322-252', '322-322', '322-324', '322-355',
])
export const MAJOR_G2_CODES = new Set([
  '225-355', '308-231', '308-232', '308-233', '308-311', '308-352',
  '344-212', '344-312', '344-334', '345-211', '460-101', '460-202', '476-201',
  '542-261', '876-102', '875-309',
])

function majorElectives(plan: Plan): Requirement[] {
  return [
    {
      kind: 'bucket',
      id: 'major_elec_g1',
      category: 'major_elective',
      label: 'วิชาเลือกสาขา (ภาควิชาคณิต-สถิติ) อย่างน้อย 12 นก',
      needCredits: 12,
      eligible: 'major_elec_g1',
      recYear: 3,
      recTerm: 1,
    },
    {
      kind: 'bucket',
      id: 'major_elec_g2',
      category: 'major_elective',
      label: `วิชาเลือกต่างคณะ/ภาควิชา ไม่เกิน ${plan === 'coop' ? 5 : 9} นก`,
      needCredits: plan === 'coop' ? 5 : 9,
      eligible: 'major_elec_g2',
      recYear: 3,
      recTerm: 1,
    },
  ]
}

// ── GE กลาง 2565 (GE1–8, 24 นก) ──
const opt = (codes: string[]) => codes.map((code) => ({ code, credits: 2 }))

const GE_2565: Requirement[] = [
  {
    kind: 'choose', id: 'ge:GE1', category: 'ge', label: 'GE1 ภาษาและการสื่อสาร (4)',
    needCredits: 4, recYear: 1, recTerm: 2,
    options: opt(['890-102G1', '890-103G1', '890-104G1', '890-105G1']),
  },
  {
    kind: 'choose', id: 'ge:GE2A', category: 'ge', label: 'GE2A การคิดเชิงตรรกะและตัวเลข (2)',
    needCredits: 2, recYear: 2, recTerm: 1,
    options: opt(['895-211G2A', '315-100G2A', '322-100G2A', '473-001G2A', '473-002G2A', '142-010G2A']),
  },
  {
    kind: 'choose', id: 'ge:GE2B', category: 'ge', label: 'GE2B การคิดเชิงระบบ (2)',
    needCredits: 2, recYear: 2, recTerm: 1,
    options: opt(['895-221G2B', '895-222G2B', '895-223G2B', '895-224G2B', '895-225G2B', '315-202G2B']),
  },
  {
    kind: 'choose', id: 'ge:GE3', category: 'ge', label: 'GE3 การคิดแบบผู้ประกอบการ (2)',
    needCredits: 2, recYear: 2, recTerm: 2,
    options: opt(['895-301G3', '895-302G3', '460-001G3', '460-001']),
    verifyNote: 'ถ้าลง 460-001 (1 นก รหัสเก่า) อาจไม่ครบ 2 นก ตามเกณฑ์ GE 2565 — ยืนยันกับอาจารย์ที่ปรึกษา/SIS',
  },
  {
    kind: 'choose', id: 'ge:GE4', category: 'ge', label: 'GE4 การใช้เทคโนโลยีดิจิทัล (2)',
    needCredits: 2, recYear: 1, recTerm: 2,
    options: opt(['315-104G4', '200-104G4', '200-107G4', '142-027G4', '345-103G4']),
  },
  {
    kind: 'choose', id: 'ge:GE5', category: 'ge', label: 'GE5 สุขภาวะองค์รวม (2)',
    needCredits: 2, recYear: 1, recTerm: 1,
    options: opt(['388-100G5', '895-501G5', '950-102G5', '670-111G5', '142-022G5', '388-100']),
    verifyNote: 'ถ้าลง 388-100 (1 นก รหัสเก่า) อาจไม่ครบ 2 นก ตามเกณฑ์ GE 2565 — ยืนยันกับอาจารย์ที่ปรึกษา/SIS',
  },
  {
    kind: 'choose', id: 'ge:GE6', category: 'ge', label: 'GE6 จิตสาธารณะและการพัฒนาที่ยั่งยืน (2)',
    needCredits: 2, recYear: 2, recTerm: 2,
    options: opt(['895-601G6', '001-102G6', '003-001G6', '003-001']),
  },
  {
    kind: 'choose', id: 'ge:GE7', category: 'ge', label: 'GE7 การปรับตัวให้เข้ากับพลวัตของโลก (2)',
    needCredits: 2, recYear: 1, recTerm: 2,
    options: opt(['820-100G7', '820-200G7', '315-201G7', '315-204G7', '895-701G7', '200-103G7', '142-024G7']),
  },
  {
    kind: 'bucket', id: 'ge:GE8', category: 'ge', label: 'GE8 รายวิชาเลือก (≥6)',
    needCredits: 6, eligible: 'ge8', recYear: 1, recTerm: 2,
  },
]

// ── GE หลักสูตรสถิติ 2564 เดิม (สาระ 1–7, 30 นก) — preset ทางเลือก ──
// รองรับทั้งรหัสเก่าและรหัส GE กลางใหม่ (equivalent) ในแต่ละสาระ
const GE_CORE_2564: Requirement[] = [
  {
    kind: 'choose', id: 'sara:1', category: 'ge', label: 'สาระ 1 ศาสตร์พระราชาและประโยชน์เพื่อนมนุษย์ (4)',
    needCredits: 4, recYear: 1, recTerm: 1,
    options: opt(['001-102', '388-100', '315-200', '003-001', '003-001G6', '388-100G5']),
  },
  {
    kind: 'choose', id: 'sara:2', category: 'ge', label: 'สาระ 2 ความเป็นพลเมืองและชีวิตที่สันติ (5)',
    needCredits: 5, recYear: 1, recTerm: 1,
    options: opt(['950-102', '895-001', '950-102G5']),
  },
  {
    kind: 'choose', id: 'sara:3', category: 'ge', label: 'สาระ 3 การเป็นผู้ประกอบการ (1)',
    needCredits: 1, recYear: 2, recTerm: 2,
    options: opt(['001-103', '460-001', '460-001G3']),
  },
  {
    kind: 'choose', id: 'sara:4', category: 'ge', label: 'สาระ 4 การอยู่อย่างรู้เท่าทันและการรู้ดิจิทัล (4)',
    needCredits: 4, recYear: 1, recTerm: 2,
    options: opt(['315-201', '345-104', '315-104G4', '315-201G7', '200-104G4']),
  },
  {
    kind: 'choose', id: 'sara:5', category: 'ge', label: 'สาระ 5 การคิดเชิงระบบ ตรรกะและตัวเลข (4)',
    needCredits: 4, recYear: 2, recTerm: 1,
    options: opt(['315-202', '315-202G2B', '142-129', '472-118', '473-001G2A', '895-211G2A', '315-100G2A', '322-100G2A']),
    verifyNote: 'ต้องมีทั้งส่วน "คิดเชิงระบบ" และ "ตรรกะ/ตัวเลข" อย่างละ 2 นก — ตรวจกับอาจารย์ที่ปรึกษา',
  },
  {
    kind: 'choose', id: 'sara:6', category: 'ge', label: 'สาระ 6 ภาษาและการสื่อสาร (4)',
    needCredits: 4, recYear: 1, recTerm: 2,
    options: opt(['890-002', '890-003', '890-004', '890-005', '890-102G1', '890-103G1', '890-104G1', '890-105G1']),
  },
  {
    kind: 'choose', id: 'sara:7', category: 'ge', label: 'สาระ 7 สุนทรียศาสตร์และกีฬา (2)',
    needCredits: 2, recYear: 2, recTerm: 1,
    options: opt(['340-162', '061-001', '315-102G8', '895-020', '895-021', '895-023', '895-024', '895-030', '895-037']),
  },
  {
    kind: 'bucket', id: 'sara:elective', category: 'ge', label: 'วิชาเลือกศึกษาทั่วไป (6)',
    needCredits: 6, eligible: 'ge8', recYear: 1, recTerm: 2,
  },
]

const FREE_ELECTIVE: Requirement = {
  kind: 'bucket',
  id: 'free',
  category: 'free_elective',
  label: 'วิชาเลือกเสรี (6)',
  needCredits: 6,
  eligible: 'free',
  recYear: 4,
  recTerm: 1,
  verifyNote: 'อาจดึงจากวิชา GE/อื่น ๆ ส่วนเกินได้ — ยืนยันกับอาจารย์ที่ปรึกษา',
}

export function buildProgram(plan: Plan, geFramework: GeFramework): Program {
  const geReqs = geFramework === 'core2564' ? GE_CORE_2564 : GE_2565
  const totalCredits = geFramework === 'ge2565' ? 132 : 138
  const requirements = [
    ...FOUNDATION,
    ...coreFor(plan),
    ...majorElectives(plan),
    ...geReqs,
    FREE_ELECTIVE,
  ]
  return { id: `stat2564-${plan}-${geFramework}`, plan, geFramework, totalCredits, requirements }
}
