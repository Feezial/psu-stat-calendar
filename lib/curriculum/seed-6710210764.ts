import type { TakenCourse } from '@/lib/types'

/** Transcript จริงของนักศึกษา 6710210764 (1/2567 – 2/2568) — ใช้เป็นข้อมูลตัวอย่าง + test fixture */
export const SEED_6710210764: TakenCourse[] = [
  // ── 1/2567 ──
  { code: '145-101', name: 'COMPANION ANIMALS', credits: 3, grade: 'A', term: '1/2567', section: '01' },
  { code: '322-101', name: 'CALCULUS I', credits: 3, grade: 'D', term: '1/2567', section: '03' },
  { code: '324-101', name: 'GENERAL CHEMISTRY I', credits: 3, grade: 'D+', term: '1/2567', section: '02' },
  { code: '325-101', name: 'GENERAL CHEMISTRY LAB I', credits: 1, grade: 'B', term: '1/2567', section: '07' },
  { code: '330-101', name: 'PRINCIPLES OF BIOLOGY I', credits: 3, grade: 'C', term: '1/2567', section: '02' },
  { code: '331-101', name: 'PRINCIPLES OF BIOLOGY LAB I', credits: 1, grade: 'C', term: '1/2567', section: '04' },
  { code: '332-101', name: 'FUNDAMENTAL PHYSICS', credits: 3, grade: 'D', term: '1/2567', section: '02' },
  { code: '333-101', name: 'FUNDAMENTAL PHYSICS LABORATORY', credits: 1, grade: 'C+', term: '1/2567', section: '11' },
  { code: '388-100', name: 'HEALTH FOR ALL', credits: 1, grade: 'P', term: '1/2567', section: '05' },
  { code: '890-101G1', name: 'ESSENTIAL ENGLISH', credits: 2, grade: 'U', term: '1/2567', section: '16' },
  { code: '950-102', name: 'HAPPY AND PEACEFUL LIFE', credits: 3, grade: 'B', term: '1/2567', section: '10' },

  // ── 2/2567 ──
  { code: '193-031G8', name: 'NATURAL THERAPY', credits: 2, grade: 'B+', term: '2/2567', section: '04' },
  { code: '200-104G4', name: 'ARTIFICIAL INTELLIGENCE LITERACY', credits: 2, grade: 'A', term: '2/2567', section: '01' },
  { code: '315-104G4', name: 'DIGITAL TECHNOLOGY LITERACY', credits: 2, grade: 'C', term: '2/2567', section: '03' },
  { code: '322-102', name: 'CALCULUS II', credits: 3, grade: 'W', term: '2/2567', section: '01' },
  { code: '346-111', name: 'PRINCIPLES OF STATISTICS', credits: 3, grade: 'D+', term: '2/2567', section: '01' },
  { code: '346-161', name: 'STANDARD STATISTICAL SOFTWARE', credits: 3, grade: 'C', term: '2/2567', section: '01' },
  { code: '460-001', name: 'IDEA TO ENTREPRENEURSHIP', credits: 1, grade: 'W', term: '2/2567', section: '06' },
  { code: '820-100G7', name: 'SAVE EARTH SAVE US', credits: 2, grade: 'D', term: '2/2567', section: '04' },
  { code: '890-102G1', name: 'EVERYDAY ENGLISH', credits: 2, grade: 'E', term: '2/2567', section: '13' },
  { code: '895-001', name: 'GOOD CITIZENS', credits: 2, grade: 'B', term: '2/2567', section: '03' },

  // ── 3/2567 (ภาคฤดูร้อน) ──
  { code: '322-102', name: 'CALCULUS II', credits: 3, grade: 'D', term: '3/2567', section: '02' },

  // ── 1/2568 ──
  { code: '003-001', name: 'VOL LEADER FOR SUS COM DEL', credits: 3, grade: 'A', term: '1/2568', section: '03' },
  { code: '315-102G8', name: 'THE AESTHETIC IN PHOTOGRAPHY', credits: 2, grade: 'B', term: '1/2568', section: '01' },
  { code: '315-202G2B', name: 'THINKING AND REASONING', credits: 2, grade: 'B+', term: '1/2568', section: '04' },
  { code: '315-205G8', name: 'SCI ENTREPRENEUR PITCHING', credits: 2, grade: 'A', term: '1/2568', section: '01' },
  { code: '346-221', name: 'PROBABILITY FOR STATISTICS', credits: 3, grade: 'D', term: '1/2568', section: '01' },
  { code: '346-222', name: 'NONPARAMETRIC STATISTICS', credits: 3, grade: 'C', term: '1/2568', section: '01' },
  { code: '346-231', name: 'INTRODUCTION TO INSURANCE', credits: 3, grade: 'B+', term: '1/2568', section: '01' },
  { code: '460-001', name: 'IDEA TO ENTREPRENEURSHIP', credits: 1, grade: 'C', term: '1/2568', section: '02' },
  { code: '890-103G1', name: 'ENGLISH ON THE GO', credits: 2, grade: 'D+', term: '1/2568', section: '10' },

  // ── 2/2568 ──
  { code: '315-201G7', name: 'LIFE IN THE FUTURE', credits: 2, grade: 'D+', term: '2/2568', section: '04' },
  { code: '346-223', name: 'MATHEMATICAL STATISTICS I', credits: 3, grade: 'D', term: '2/2568', section: '01' },
  { code: '346-232', name: 'REGRESSION ANALYSIS', credits: 4, grade: 'D+', term: '2/2568', section: '01' },
  { code: '346-241', name: 'MO:LINEAR ALGEBRA & OPERA RES', credits: 5, grade: 'C', term: '2/2568', section: '01' },
  { code: '346-261', name: 'BASIC COMPUTER PROGRAMMING', credits: 2, grade: 'C', term: '2/2568', section: '01' },
  { code: '346-343', name: 'INVENTORY MANAGEMENT', credits: 3, grade: 'W', term: '2/2568', section: '01' },
  { code: '473-001G2A', name: 'FINANCE LITE FOR A BETTER LIFE', credits: 2, grade: 'E', term: '2/2568', section: '01' },
  { code: '820-200G7', name: 'DISRUPTED SEA', credits: 2, grade: 'C', term: '2/2568', section: '02' },
  { code: '890-102G1', name: 'EVERYDAY ENGLISH', credits: 2, grade: 'C', term: '2/2568', section: '05' },
]
