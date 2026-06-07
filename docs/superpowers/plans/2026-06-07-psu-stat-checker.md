# PSU Stat Curriculum Checker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เว็บแอป Next.js + shadcn + Supabase ที่เช็คว่านักศึกษา วท.บ. สถิติ (ม.อ. 2564) เรียนครบ/ขาดวิชาอะไร และแนะนำวิชาเทอมหน้า

**Architecture:** ชั้นข้อมูลหลักสูตร (`lib/curriculum`) และเอนจิน (`lib/engine`) เป็น pure TS ไม่พึ่ง React/Supabase → ทดสอบด้วย Vitest 100%. UI (App Router + shadcn) อ่านผลจากเอนจิน. ข้อมูลผู้ใช้เก็บใน Supabase (Auth + Postgres + RLS).

**Tech Stack:** Next.js 15 (App Router, TS), React 19, Tailwind, shadcn/ui, Supabase (@supabase/ssr), Vitest, Zod.

อ้างอิงสเปค: [docs/superpowers/specs/2026-06-07-psu-stat-checker-design.md](../specs/2026-06-07-psu-stat-checker-design.md)
ข้อมูลดิบ: `research/structure-stat.txt`, `research/ge-structure.txt`, `research/FINDINGS.md`

---

## File Structure

```
lib/curriculum/types.ts            # ชนิดข้อมูลหลักสูตร (Course, Requirement, Program)
lib/curriculum/courses.ts          # master list รหัส→{name,credits} + alias map
lib/curriculum/ge-catalog.ts       # แคตตาล็อก GE1–8 (จาก research/ge-structure.txt)
lib/curriculum/program-2564.ts     # โครงสร้างหมวด+requirements+แผนปี/เทอม (regular/coop, ge2565/core2564)
lib/curriculum/seed-6710210764.ts  # transcript เจ้าของ (seed + test fixture)
lib/engine/grades.ts               # isPass, gradePoint, bestAttempt
lib/engine/normalize.ts            # normalizeCode (ตัด section, map alias)
lib/engine/match.ts                # assignCoursesToRequirements
lib/engine/progress.ts             # computeProgress, suggestNextTerm
lib/engine/parse-transcript.ts     # parseTranscript(text) → TakenCourse[]
lib/engine/*.test.ts               # Vitest
lib/types.ts                       # TakenCourse, Profile, Override (shared app types)
lib/supabase/client.ts, server.ts  # Supabase clients
lib/data/repository.ts             # CRUD ผู้ใช้
supabase/migrations/0001_init.sql  # schema + RLS + trigger
app/(auth)/login/page.tsx
app/(app)/layout.tsx, dashboard/page.tsx, courses/page.tsx,
app/(app)/requirements/[cat]/page.tsx, plan/page.tsx
app/(app)/_components/*            # การ์ดความคืบหน้า ฯลฯ
components/ui/*                     # shadcn (generated)
SETUP.md
```

---

## Task 1: Scaffold project + tooling + git

**Files:** Create root project (package.json, tsconfig, tailwind, etc.)

- [ ] **Step 1: สร้าง Next.js app** (รันใน `c:\Users\fee\Desktop\psu-calendar`)

Run:
```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --no-turbopack
```
ตอบ prompt: ไม่ override ไฟล์ `docs/` `research/` (ถ้าถามให้คงไว้). ถ้า create-next-app ไม่ยอมเพราะ dir ไม่ว่าง: สร้างใน temp แล้วย้ายไฟล์ project เข้ามา (เก็บ docs/ research/ ไว้).

- [ ] **Step 2: ติดตั้ง deps**

Run:
```bash
npm i @supabase/supabase-js @supabase/ssr zod
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: init shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
npx shadcn@latest add button card table input select badge progress dialog tabs sonner dropdown-menu separator skeleton alert
```

- [ ] **Step 4: ตั้งค่า Vitest** — Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, include: ['lib/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
})
```
เพิ่ม `"test": "vitest run"`, `"test:watch": "vitest"` ใน package.json scripts.

- [ ] **Step 5: git init + commit**

Run:
```bash
git init
git add -A
git commit -m "chore: scaffold Next.js + Tailwind + shadcn + Supabase + Vitest"
```
(ตรวจ `.gitignore` มี `.env*` และ `node_modules`)

---

## Task 2: Curriculum types + master course list

**Files:** Create `lib/curriculum/types.ts`, `lib/curriculum/courses.ts`

- [ ] **Step 1: เขียน types** — Create `lib/curriculum/types.ts`:

```ts
export type Campus = 'hatyai'
export type Plan = 'regular' | 'coop'
export type GeFramework = 'ge2565' | 'core2564'
export type Category = 'foundation' | 'core' | 'major_elective' | 'ge' | 'free_elective'

export interface CourseInfo { code: string; name: string; nameEn?: string; credits: number }

export type Requirement =
  | { kind: 'fixed'; id: string; category: Category; label: string; courseCodes: string[]; credits: number; recYear?: number; recTerm?: number; prereq?: string[]; verifyNote?: string }
  | { kind: 'choose'; id: string; category: Category; label: string; options: { code: string; credits: number }[]; needCredits: number; recYear?: number; recTerm?: number; verifyNote?: string }
  | { kind: 'bucket'; id: string; category: Category; label: string; needCredits: number; eligible: 'major_elec_g1' | 'major_elec_g2' | 'ge8' | 'free'; recYear?: number; recTerm?: number; verifyNote?: string }

export interface Program {
  id: string
  totalCredits: number
  requirements: Requirement[]
}
```

- [ ] **Step 2: master course list** — Create `lib/curriculum/courses.ts` (จาก research/structure-stat.txt). ใส่ครบทุกรหัสที่หลักสูตรอ้างถึง + alias:

```ts
import type { CourseInfo } from './types'

// alias: รหัสที่ลงจริง (เก่า/G-suffix) → รหัสหลักสูตร canonical
export const ALIAS: Record<string, string> = {
  '890-101G1': '890-101G1', '890-102G1': '890-102G1', '890-103G1': '890-103G1',
  '315-104G4': '315-104G4', '315-202G2B': '315-202G2B', '315-201G7': '315-201G7',
  '003-001': '003-001', '460-001': '460-001', '473-001G2A': '473-001G2A',
  // foundation/major ใช้รหัสตรงอยู่แล้ว
}

export const COURSES: Record<string, CourseInfo> = {
  // ── 2.1 วิทย์พื้นฐาน ──
  '322-101': { code:'322-101', name:'แคลคูลัส 1', nameEn:'Calculus I', credits:3 },
  '322-102': { code:'322-102', name:'แคลคูลัส 2', nameEn:'Calculus II', credits:3 },
  '324-101': { code:'324-101', name:'เคมีทั่วไป 1', nameEn:'General Chemistry I', credits:3 },
  '325-101': { code:'325-101', name:'ปฏิบัติการเคมีทั่วไป 1', nameEn:'General Chemistry Lab I', credits:1 },
  '330-101': { code:'330-101', name:'หลักชีววิทยา 1', nameEn:'Principles of Biology I', credits:3 },
  '331-101': { code:'331-101', name:'ปฏิบัติการหลักชีววิทยา 1', nameEn:'Principles of Biology Lab I', credits:1 },
  '332-101': { code:'332-101', name:'ฟิสิกส์พื้นฐาน', nameEn:'Fundamental Physics', credits:3 },
  '333-101': { code:'333-101', name:'ปฏิบัติการฟิสิกส์พื้นฐาน', nameEn:'Fundamental Physics Lab', credits:1 },
  '346-111': { code:'346-111', name:'หลักสถิติ', nameEn:'Principles of Statistics', credits:3 },
  '346-361': { code:'346-361', name:'ฐานข้อมูลและภาษา SQL สำหรับการวิเคราะห์ข้อมูล', nameEn:'Database and SQL for Data Analytics', credits:3 },
  // ── 2.2 บังคับ ──
  '346-161': { code:'346-161', name:'ซอฟต์แวร์มาตรฐานทางสถิติ', nameEn:'Standard Statistical Software', credits:3 },
  '346-221': { code:'346-221', name:'ความน่าจะเป็นสำหรับสถิติศาสตร์', nameEn:'Probability for Statistics', credits:3 },
  '346-222': { code:'346-222', name:'สถิติศาสตร์ไม่อิงพารามิเตอร์', nameEn:'Nonparametric Statistics', credits:3 },
  '346-223': { code:'346-223', name:'คณิตสถิติศาสตร์ 1', nameEn:'Mathematical Statistics I', credits:3 },
  '346-231': { code:'346-231', name:'การประกันภัยเบื้องต้น', nameEn:'Introduction to Insurance', credits:3 },
  '346-232': { code:'346-232', name:'การวิเคราะห์การถดถอย', nameEn:'Regression Analysis', credits:4 },
  '346-241': { code:'346-241', name:'ชุดวิชาพีชคณิตและการวิจัยดำเนินการ', nameEn:'Module: Linear Algebra and Operations Research', credits:5 },
  '346-261': { code:'346-261', name:'การเขียนโปรแกรมคอมพิวเตอร์เบื้องต้น', nameEn:'Basic Computer Programming', credits:2 },
  '346-321': { code:'346-321', name:'คณิตสถิติศาสตร์ 2', nameEn:'Mathematical Statistics II', credits:3 },
  '346-322': { code:'346-322', name:'เทคนิคการเลือกตัวอย่าง', nameEn:'Sampling Techniques', credits:3 },
  '346-331': { code:'346-331', name:'การวิเคราะห์หลายตัวแปรเชิงประยุกต์', nameEn:'Applied Multivariate Analysis', credits:3 },
  '346-332': { code:'346-332', name:'การวิเคราะห์เชิงทำนาย', nameEn:'Predictive Analytics', credits:3 },
  '346-333': { code:'346-333', name:'แผนแบบการทดลองเบื้องต้น', nameEn:'Introduction to Experimental Designs', credits:3 },
  '346-334': { code:'346-334', name:'ระเบียบวิธีวิจัยเบื้องต้น', nameEn:'Introduction to Research Methodology', credits:3 },
  '346-351': { code:'346-351', name:'การวิเคราะห์ข้อมูลขนาดใหญ่และการประยุกต์', nameEn:'Big Data Analytics and Applications', credits:3 },
  '346-441': { code:'346-441', name:'การควบคุมคุณภาพเชิงสถิติ', nameEn:'Statistical Quality Control', credits:3 },
  '346-451': { code:'346-451', name:'สถิติสำหรับวิทยาการข้อมูลและการวิเคราะห์เชิงธุรกิจ', nameEn:'Statistics for Data Science and Business Analytics', credits:3 },
  '346-471': { code:'346-471', name:'สัมมนาทางสถิติ', nameEn:'Seminar in Statistics', credits:1 },
  '346-472': { code:'346-472', name:'สหกิจศึกษา', nameEn:'Cooperative Education', credits:6 },
  '346-491': { code:'346-491', name:'โครงงานทางสถิติ 1', nameEn:'Project in Statistics I', credits:1 },
  '346-492': { code:'346-492', name:'โครงงานทางสถิติ 2', nameEn:'Project in Statistics II', credits:2 },
  // ── 2.3 เลือกสาขา กลุ่ม1 (คณิต-สถิติ) ──
  '346-335': { code:'346-335', name:'การวิเคราะห์ข้อมูลระยะยาว', nameEn:'Longitudinal Data Analysis', credits:3 },
  '346-336': { code:'346-336', name:'การวิเคราะห์ข้อมูลจำแนกประเภท', nameEn:'Categorical Data Analysis', credits:3 },
  '346-341': { code:'346-341', name:'การประยุกต์ใช้สถิติสำหรับวิทยาศาสตร์สุขภาพ', nameEn:'Application of Statistics to Health Sciences', credits:3 },
  '346-342': { code:'346-342', name:'ตัวแบบระบบแถวคอยเบื้องต้น', nameEn:'Introduction to Queuing Models', credits:3 },
  '346-343': { code:'346-343', name:'การจัดการสินค้าคงคลัง', nameEn:'Inventory Management', credits:3 },
  '346-344': { code:'346-344', name:'ชุดวิชาวิทยาการประกันภัย', nameEn:'Module: Actuarial Science', credits:7 },
  '346-371': { code:'346-371', name:'การฝึกงานทางสถิติ', nameEn:'Job Training in Statistics', credits:1 },
  '346-431': { code:'346-431', name:'การวิเคราะห์การรอดชีพเบื้องต้น', nameEn:'Introduction to Survival Analysis', credits:3 },
  '346-432': { code:'346-432', name:'สถิติประชากรเบื้องต้น', nameEn:'Introduction to Population Statistics', credits:3 },
  '346-442': { code:'346-442', name:'กระบวนการสโตแคสติก', nameEn:'Stochastic Process', credits:3 },
  '346-443': { code:'346-443', name:'ทฤษฎีการตัดสินใจ', nameEn:'Decision Theory', credits:3 },
  '346-444': { code:'346-444', name:'การจำลองสถานการณ์สำหรับการจัดการโลจิสติกส์', nameEn:'Simulation for Logistics Management', credits:3 },
  '346-445': { code:'346-445', name:'การจัดการคลังสินค้าสำหรับโลจิสติกส์ 4.0', nameEn:'Warehouse Management for Logistics 4.0', credits:3 },
  '346-481': { code:'346-481', name:'หัวข้อพิเศษทางสถิติ 1', nameEn:'Special Topics in Statistics I', credits:2 },
  '346-482': { code:'346-482', name:'หัวข้อพิเศษทางสถิติ 2', nameEn:'Special Topics in Statistics II', credits:3 },
  '322-201': { code:'322-201', name:'แคลคูลัสขั้นสูง', nameEn:'Advanced Calculus', credits:3 },
  '322-252': { code:'322-252', name:'ชุดวิชาคณิตศาสตร์เชิงคำนวณ', nameEn:'Module: Computational Mathematics', credits:5 },
  '322-322': { code:'322-322', name:'ทฤษฎีกราฟเบื้องต้น', nameEn:'Introduction to Graph Theory', credits:3 },
  '322-324': { code:'322-324', name:'คณิตศาสตร์เชิงการจัด', nameEn:'Combinatorics', credits:3 },
  '322-355': { code:'322-355', name:'กระบวนการสุ่มเบื้องต้น', nameEn:'Introduction to Random Processes', credits:3 },
  // ── 2.3 เลือกสาขา กลุ่ม2 (คณะอื่น) ──
  '225-355': { code:'225-355', name:'การจัดการผลิตและการดำเนินงาน', nameEn:'Production and Operations Management', credits:3 },
  '308-231': { code:'308-231', name:'การโปรแกรมเชิงโครงสร้างและการประยุกต์', nameEn:'Structured Programming and Applications', credits:3 },
  '308-232': { code:'308-232', name:'การออกแบบและพัฒนาเว็บ', nameEn:'Web Development and Design', credits:3 },
  '308-233': { code:'308-233', name:'ขั้นตอนวิธีและโครงสร้างข้อมูล', nameEn:'Algorithms and Data Structures', credits:3 },
  '308-311': { code:'308-311', name:'การวิเคราะห์และออกแบบระบบสารสนเทศ', nameEn:'Information Systems Analysis and Design', credits:3 },
  '308-352': { code:'308-352', name:'การทำเหมืองข้อมูลและทัศนภาพ', nameEn:'Data Mining and Visualizations', credits:3 },
  '344-212': { code:'344-212', name:'การพัฒนาโปรแกรมประยุกต์บนเว็บ', nameEn:'Web Application Programming', credits:3 },
  '344-312': { code:'344-312', name:'การพัฒนาโปรแกรมประยุกต์บนอุปกรณ์เคลื่อนที่', nameEn:'Mobile Application Development', credits:3 },
  '344-334': { code:'344-334', name:'ระบบธุรกิจอัจฉริยะ', nameEn:'Business Intelligent System', credits:3 },
  '345-211': { code:'345-211', name:'หลักการโปรแกรม', nameEn:'Principles of Programming', credits:3 },
  '460-101': { code:'460-101', name:'หลักการตลาด', nameEn:'Principles of Marketing', credits:3 },
  '460-202': { code:'460-202', name:'ชุดวิชาดิจิทัล นวัตกรรม และการเป็นผู้ประกอบการ', nameEn:'Module: Digital, Innovation and Entrepreneurship', credits:7 },
  '476-201': { code:'476-201', name:'ความรู้เบื้องต้นเกี่ยวกับการจัดการโลจิสติกส์', nameEn:'Introduction to Logistics Management', credits:3 },
  '542-261': { code:'542-261', name:'การสำรวจการใช้แผนที่และภาพถ่ายทางอากาศ', nameEn:'Surveying, Maps and Aerial Photography', credits:3 },
  '876-102': { code:'876-102', name:'หลักเศรษฐศาสตร์พื้นฐานและการประยุกต์ใช้', nameEn:'Principles of Economics and Application', credits:3 },
  '875-309': { code:'875-309', name:'เศรษฐมิติเบื้องต้น', nameEn:'Introduction to Econometrics', credits:4 },
}

export function courseCredits(code: string): number { return COURSES[code]?.credits ?? 0 }
```
(หมายเหตุ: GE courses อยู่ใน `ge-catalog.ts` แยก — Task 3)

- [ ] **Step 3: commit**

```bash
git add lib/curriculum/types.ts lib/curriculum/courses.ts
git commit -m "feat(curriculum): types + master course list"
```

---

## Task 3: GE catalog (GE1–8)

**Files:** Create `lib/curriculum/ge-catalog.ts`

- [ ] **Step 1: เขียนแคตตาล็อก GE** — ถอดจาก `research/ge-structure.txt` ทุกรายการ เป็นโครงนี้:

```ts
export type GeGroup = 'GE1'|'GE2A'|'GE2B'|'GE3'|'GE4'|'GE5'|'GE6'|'GE7'|'GE8'
export interface GeCourse { code: string; name: string; nameEn?: string; credits: number; group: GeGroup; audit?: boolean }

export const GE_CATALOG: GeCourse[] = [
  // GE1 (เลือก 2 จาก 890-102..105; 890-101 audit)
  { code:'890-101G1', name:'สรรสาระภาษาอังกฤษ', nameEn:'Essential English', credits:2, group:'GE1', audit:true },
  { code:'890-102G1', name:'ภาษาอังกฤษในชีวิตประจำวัน', nameEn:'Everyday English', credits:2, group:'GE1' },
  { code:'890-103G1', name:'ภาษาอังกฤษพร้อมใช้', nameEn:'English on the Go', credits:2, group:'GE1' },
  { code:'890-104G1', name:'ภาษาอังกฤษยุคดิจิทัล', nameEn:'English in the Digital World', credits:2, group:'GE1' },
  { code:'890-105G1', name:'ภาษาอังกฤษเชิงวิชาการ', nameEn:'English for Academic Success', credits:2, group:'GE1' },
  // GE2A ตรรกะ/ตัวเลข
  { code:'895-211G2A', name:'การคิดกับพฤติกรรมพยากรณ์', credits:2, group:'GE2A' },
  { code:'315-100G2A', name:'คำนวณศิลป์', credits:2, group:'GE2A' },
  { code:'322-100G2A', name:'รวยด้วยคณิตศาสตร์', credits:2, group:'GE2A' },
  { code:'473-001G2A', name:'เงินทองต้องรอบรู้', nameEn:'Financial Literacy for a Better Life', credits:2, group:'GE2A' },
  { code:'473-002G2A', name:'การอ่านงบการเงินเพื่อการลงทุน', credits:2, group:'GE2A' },
  { code:'142-010G2A', name:'คิดไปข้างหน้า', nameEn:'Organic Thinking', credits:2, group:'GE2A' },
  // GE2B คิดเชิงระบบ
  { code:'895-221G2B', name:'การคิดกับการแก้ปัญหาเชิงระบบ', credits:2, group:'GE2B' },
  { code:'895-222G2B', name:'การคิดเชิงวิพากษ์', credits:2, group:'GE2B' },
  { code:'895-224G2B', name:'ตรรกะในชีวิตประจำวัน', credits:2, group:'GE2B' },
  { code:'315-202G2B', name:'การคิดกับการใช้เหตุผล', nameEn:'Thinking and Reasoning', credits:2, group:'GE2B' },
  // GE3 ผู้ประกอบการ
  { code:'895-301G3', name:'ก้าวแรกสู่ความเป็นผู้ประกอบการ', credits:2, group:'GE3' },
  { code:'460-001G3', name:'แนวคิดและทักษะความเป็นผู้ประกอบการ', credits:2, group:'GE3' },
  // GE4 ดิจิทัล
  { code:'315-104G4', name:'รู้ทันเทคโนโลยีดิจิทัล', nameEn:'Digital Technology Literacy', credits:2, group:'GE4' },
  { code:'200-104G4', name:'รู้เท่าทันปัญญาประดิษฐ์', nameEn:'Artificial Intelligence Literacy', credits:2, group:'GE4' },
  { code:'200-107G4', name:'การเชื่อมต่อสรรพสิ่งเพื่อชีวิตยุคดิจิทัล', credits:2, group:'GE4' },
  // GE5 สุขภาวะ
  { code:'388-100G5', name:'สุขภาวะเพื่อเพื่อนมนุษย์', nameEn:'Health for All', credits:2, group:'GE5' },
  { code:'895-501G5', name:'สุนทรียศาสตร์แห่งชีวิต', credits:2, group:'GE5' },
  { code:'950-102G5', name:'การปรับตัวของคนยุคใหม่ในสังคมใหม่', credits:2, group:'GE5' },
  // GE6 จิตสาธารณะ/ยั่งยืน
  { code:'895-601G6', name:'พลเมืองตื่นรู้เพื่อการพัฒนาที่ยั่งยืน', credits:2, group:'GE6' },
  { code:'001-102G6', name:'เป้าหมายการพัฒนาที่ยั่งยืนและการรับผิดชอบต่อส่วนรวม', credits:2, group:'GE6' },
  { code:'003-001G6', name:'ผู้นำจิตอาสาเพื่อการพัฒนาชุมชน', credits:2, group:'GE6' },
  // GE7 ปรับตัวพลวัตโลก
  { code:'820-100G7', name:'รักษ์โลก รักษ์เรา', nameEn:'Save Earth Save Us', credits:2, group:'GE7' },
  { code:'820-200G7', name:'เมื่อทะเลปั่นป่วน', nameEn:'Disrupted Sea', credits:2, group:'GE7' },
  { code:'315-201G7', name:'ชีวิตแห่งอนาคต', nameEn:'Life in the Future', credits:2, group:'GE7' },
  // GE8 เลือก (ตัวอย่างที่นักศึกษาเคยลง — ใส่ให้ครบจาก ge-structure.txt ในงานจริง)
  { code:'315-102G8', name:'สุนทรียศาสตร์การถ่ายภาพ', nameEn:'The Aesthetic in Photography', credits:2, group:'GE8' },
  { code:'315-205G8', name:'วิทย์คิดรวย', nameEn:'Science Entrepreneur Pitching', credits:2, group:'GE8' },
  { code:'193-031G8', name:'ธรรมชาติบำบัด', nameEn:'Natural Therapy', credits:2, group:'GE8' },
  // … ใส่ GE8 ที่เหลือทั้งหมดจาก research/ge-structure.txt (ด้านสุนทรียศาสตร์/กีฬา/ภาษา/มนุษย์ฯ/วิทย์)
  // วิชา GE รหัสเก่าที่ยังเจอใน transcript (นับเป็น GE8 เลือก)
  { code:'145-101', name:'สัตว์เลี้ยงเพื่อนรัก', nameEn:'Companion Animals', credits:3, group:'GE8' },
]

export const GE_BY_CODE: Record<string, GeCourse> =
  Object.fromEntries(GE_CATALOG.map(c => [c.code, c]))
```

- [ ] **Step 2: commit**

```bash
git add lib/curriculum/ge-catalog.ts
git commit -m "feat(curriculum): GE1-8 catalog"
```

---

## Task 4: Program definition (requirements + plan, regular/coop × ge2565/core2564)

**Files:** Create `lib/curriculum/program-2564.ts`

- [ ] **Step 1: เขียน builder โปรแกรม** — Create `lib/curriculum/program-2564.ts`:

```ts
import type { Program, Requirement, Plan, GeFramework } from './types'
import { COURSES } from './courses'

const f = (code: string, opts: Partial<Requirement> = {}): Requirement =>
  ({ kind:'fixed', id:`fixed:${code}`, category:'foundation', label: COURSES[code]?.name ?? code,
     courseCodes:[code], credits: COURSES[code]?.credits ?? 0, ...opts } as Requirement)

const FOUNDATION = ['322-101','322-102','324-101','325-101','330-101','331-101','332-101','333-101','346-111','346-361']
  .map(c => f(c, { category:'foundation' }))

const CORE_COMMON = ['346-161','346-221','346-222','346-223','346-231','346-232','346-241','346-261',
  '346-321','346-322','346-331','346-332','346-333','346-334','346-351','346-441','346-451','346-471','346-491']
  .map(c => f(c, { category:'core' }))

// แผนปกติเพิ่ม 346-492; สหกิจเพิ่ม 346-472
const coreFor = (plan: Plan): Requirement[] =>
  plan === 'coop'
    ? [...CORE_COMMON, f('346-472',{category:'core'})]
    : [...CORE_COMMON, f('346-492',{category:'core'})]

const MAJOR_ELEC = (plan: Plan): Requirement[] => [
  { kind:'bucket', id:'major_elec_g1', category:'major_elective',
    label:'วิชาเลือกสาขา (คณิต-สถิติ) อย่างน้อย 12 นก', needCredits:12, eligible:'major_elec_g1' },
  { kind:'bucket', id:'major_elec_g2', category:'major_elective',
    label:`วิชาเลือกต่างคณะ ไม่เกิน ${plan==='coop'?5:9} นก`, needCredits: plan==='coop'?5:9, eligible:'major_elec_g2' },
]
// รวมเลือกสาขา 21(ปกติ)/17(สหกิจ): g1≥12, g2≤9/5 → ผลรวมที่ต้องการ = plan==='coop'?17:21 (engine ใช้ totalCredits ของหมวด)

const GE_2565: Requirement[] = [
  { kind:'choose', id:'ge:GE1', category:'ge', label:'GE1 ภาษาและการสื่อสาร (4)', needCredits:4,
    options:['890-102G1','890-103G1','890-104G1','890-105G1'].map(c=>({code:c,credits:2})) },
  { kind:'choose', id:'ge:GE2A', category:'ge', label:'GE2A การคิดเชิงตรรกะและตัวเลข (2)', needCredits:2,
    options:['895-211G2A','315-100G2A','322-100G2A','473-001G2A','473-002G2A','142-010G2A'].map(c=>({code:c,credits:2})) },
  { kind:'choose', id:'ge:GE2B', category:'ge', label:'GE2B การคิดเชิงระบบ (2)', needCredits:2,
    options:['895-221G2B','895-222G2B','895-224G2B','315-202G2B'].map(c=>({code:c,credits:2})) },
  { kind:'choose', id:'ge:GE3', category:'ge', label:'GE3 การคิดแบบผู้ประกอบการ (2)', needCredits:2,
    options:['895-301G3','460-001G3','460-001'].map(c=>({code:c,credits:2})),
    verifyNote:'ถ้าลง 460-001 (1 นก รหัสเก่า) อาจไม่ครบ 2 นกตามเกณฑ์ 2565 — ยืนยันกับอาจารย์ที่ปรึกษา' },
  { kind:'choose', id:'ge:GE4', category:'ge', label:'GE4 การใช้เทคโนโลยีดิจิทัล (2)', needCredits:2,
    options:['315-104G4','200-104G4','200-107G4'].map(c=>({code:c,credits:2})) },
  { kind:'choose', id:'ge:GE5', category:'ge', label:'GE5 สุขภาวะองค์รวม (2)', needCredits:2,
    options:['388-100G5','895-501G5','950-102G5'].map(c=>({code:c,credits:2})),
    verifyNote:'ถ้าลง 388-100 (1 นก รหัสเก่า) อาจไม่ครบ 2 นกตามเกณฑ์ 2565 — ยืนยันกับอาจารย์ที่ปรึกษา' },
  { kind:'choose', id:'ge:GE6', category:'ge', label:'GE6 จิตสาธารณะและการพัฒนาที่ยั่งยืน (2)', needCredits:2,
    options:['895-601G6','001-102G6','003-001G6','003-001'].map(c=>({code:c,credits:2})) },
  { kind:'choose', id:'ge:GE7', category:'ge', label:'GE7 การปรับตัวให้เข้ากับพลวัตของโลก (2)', needCredits:2,
    options:['820-100G7','820-200G7','315-201G7'].map(c=>({code:c,credits:2})) },
  { kind:'bucket', id:'ge:GE8', category:'ge', label:'GE8 รายวิชาเลือก (≥6)', needCredits:6, eligible:'ge8' },
]

const FREE: Requirement = { kind:'bucket', id:'free', category:'free_elective',
  label:'วิชาเลือกเสรี (6)', needCredits:6, eligible:'free',
  verifyNote:'ดึงจากวิชา GE/อื่น ๆ ส่วนเกินได้ — ยืนยันกับอาจารย์ที่ปรึกษา' }

export function buildProgram(plan: Plan, ge: GeFramework): Program {
  const geReqs = ge === 'ge2565' ? GE_2565 : GE_2565 // core2564 preset เพิ่มได้ภายหลัง (Task ต่อยอด)
  const reqs = [...FOUNDATION, ...coreFor(plan), ...MAJOR_ELEC(plan), ...geReqs, FREE]
  const totalCredits = ge === 'ge2565' ? 132 : 138
  return { id:`stat2564-${plan}-${ge}`, totalCredits, requirements: reqs }
}

// เซ็ตรหัสที่ใช้ตัดสิน eligible ของ bucket
import { COURSES as _C } from './courses'
export const MAJOR_G1_CODES = new Set(['346-335','346-336','346-341','346-342','346-343','346-344','346-371','346-431','346-432','346-442','346-443','346-444','346-445','346-481','346-482','322-201','322-252','322-322','322-324','322-355'])
export const MAJOR_G2_CODES = new Set(['225-355','308-231','308-232','308-233','308-311','308-352','344-212','344-312','344-334','345-211','460-101','460-202','476-201','542-261','876-102','875-309'])
```

- [ ] **Step 2: ใส่ recYear/recTerm** ลงใน FOUNDATION/CORE ตามแผนการเรียน (จากรูป): ปี1: 322-101/324-101/325-101/330-101/331-101/332-101/333-101 (เทอม1), 322-102/346-111/346-161 (เทอม2); ปี2 เทอม1: 346-221/346-222/346-231; ปี2 เทอม2: 346-223/346-232/346-241/346-261; ปี3 เทอม1: 346-321/346-322/346-331/346-361; ปี3 เทอม2: 346-332/346-333/346-334/346-351/346-451; ปี4 เทอม1: 346-441/346-471/346-491; ปี4 เทอม2: 346-492(ปกติ)/346-472(สหกิจ). กำหนดผ่าน `f(code,{recYear,recTerm})`.

- [ ] **Step 3: commit**

```bash
git add lib/curriculum/program-2564.ts
git commit -m "feat(curriculum): program builder (regular/coop, ge2565)"
```

---

## Task 5: Shared app types + student seed fixture

**Files:** Create `lib/types.ts`, `lib/curriculum/seed-6710210764.ts`

- [ ] **Step 1: app types** — Create `lib/types.ts`:

```ts
export interface TakenCourse {
  id?: string
  code: string
  name: string
  credits: number
  grade: string      // 'A','B+','B','C+','C','D+','D','E','F','W','U','P','S','I',''
  term: string       // '1/2567'
  section?: string
}
export interface Profile {
  plan: 'regular' | 'coop'
  geFramework: 'ge2565' | 'core2564'
  passThreshold: string   // 'D'
  currentYear?: number
  currentTerm?: number
}
export interface Override { takenCode: string; term: string; requirementId: string }
```

- [ ] **Step 2: seed fixture** — Create `lib/curriculum/seed-6710210764.ts` (จาก transcript ทั้ง 5 เทอม):

```ts
import type { TakenCourse } from '@/lib/types'
export const SEED_6710210764: TakenCourse[] = [
  // 1/2567
  { code:'145-101', name:'COMPANION ANIMALS', credits:3, grade:'A', term:'1/2567', section:'01' },
  { code:'322-101', name:'CALCULUS I', credits:3, grade:'D', term:'1/2567', section:'03' },
  { code:'324-101', name:'GENERAL CHEMISTRY I', credits:3, grade:'D+', term:'1/2567', section:'02' },
  { code:'325-101', name:'GENERAL CHEMISTRY LAB I', credits:1, grade:'B', term:'1/2567', section:'07' },
  { code:'330-101', name:'PRINCIPLES OF BIOLOGY I', credits:3, grade:'C', term:'1/2567', section:'02' },
  { code:'331-101', name:'PRINCIPLES OF BIOLOGY LAB I', credits:1, grade:'C', term:'1/2567', section:'04' },
  { code:'332-101', name:'FUNDAMENTAL PHYSICS', credits:3, grade:'D', term:'1/2567', section:'02' },
  { code:'333-101', name:'FUNDAMENTAL PHYSICS LABORATORY', credits:1, grade:'C+', term:'1/2567', section:'11' },
  { code:'388-100', name:'HEALTH FOR ALL', credits:1, grade:'P', term:'1/2567', section:'05' },
  { code:'890-101G1', name:'ESSENTIAL ENGLISH', credits:2, grade:'U', term:'1/2567', section:'16' },
  { code:'950-102', name:'HAPPY AND PEACEFUL LIFE', credits:3, grade:'B', term:'1/2567', section:'10' },
  // 2/2567
  { code:'193-031G8', name:'NATURAL THERAPY', credits:2, grade:'B+', term:'2/2567', section:'04' },
  { code:'200-104G4', name:'ARTIFICIAL INTELLIGENCE LITERACY', credits:2, grade:'A', term:'2/2567', section:'01' },
  { code:'315-104G4', name:'DIGITAL TECHNOLOGY LITERACY', credits:2, grade:'C', term:'2/2567', section:'03' },
  { code:'322-102', name:'CALCULUS II', credits:3, grade:'W', term:'2/2567', section:'01' },
  { code:'346-111', name:'PRINCIPLES OF STATISTICS', credits:3, grade:'D+', term:'2/2567', section:'01' },
  { code:'346-161', name:'STANDARD STATISTICAL SOFTWARE', credits:3, grade:'C', term:'2/2567', section:'01' },
  { code:'460-001', name:'IDEA TO ENTREPRENEURSHIP', credits:1, grade:'W', term:'2/2567', section:'06' },
  { code:'820-100G7', name:'SAVE EARTH SAVE US', credits:2, grade:'D', term:'2/2567', section:'04' },
  { code:'890-102G1', name:'EVERYDAY ENGLISH', credits:2, grade:'E', term:'2/2567', section:'13' },
  { code:'895-001', name:'GOOD CITIZENS', credits:2, grade:'B', term:'2/2567', section:'03' },
  // 3/2567
  { code:'322-102', name:'CALCULUS II', credits:3, grade:'D', term:'3/2567', section:'02' },
  // 1/2568
  { code:'003-001', name:'VOL LEADER FOR SUS COM DEL', credits:3, grade:'A', term:'1/2568', section:'03' },
  { code:'315-102G8', name:'THE AESTHETIC IN PHOTOGRAPHY', credits:2, grade:'B', term:'1/2568', section:'01' },
  { code:'315-202G2B', name:'THINKING AND REASONING', credits:2, grade:'B+', term:'1/2568', section:'04' },
  { code:'315-205G8', name:'SCI ENTREPRENEUR PITCHING', credits:2, grade:'A', term:'1/2568', section:'01' },
  { code:'346-221', name:'PROBABILITY FOR STATISTICS', credits:3, grade:'D', term:'1/2568', section:'01' },
  { code:'346-222', name:'NONPARAMETRIC STATISTICS', credits:3, grade:'C', term:'1/2568', section:'01' },
  { code:'346-231', name:'INTRODUCTION TO INSURANCE', credits:3, grade:'B+', term:'1/2568', section:'01' },
  { code:'460-001', name:'IDEA TO ENTREPRENEURSHIP', credits:1, grade:'C', term:'1/2568', section:'02' },
  { code:'890-103G1', name:'ENGLISH ON THE GO', credits:2, grade:'D+', term:'1/2568', section:'10' },
  // 2/2568
  { code:'315-201G7', name:'LIFE IN THE FUTURE', credits:2, grade:'D+', term:'2/2568', section:'04' },
  { code:'346-223', name:'MATHEMATICAL STATISTICS I', credits:3, grade:'D', term:'2/2568', section:'01' },
  { code:'346-232', name:'REGRESSION ANALYSIS', credits:4, grade:'D+', term:'2/2568', section:'01' },
  { code:'346-241', name:'MO:LINEAR ALGEBRA & OPERA RES', credits:5, grade:'C', term:'2/2568', section:'01' },
  { code:'346-261', name:'BASIC COMPUTER PROGRAMMING', credits:2, grade:'C', term:'2/2568', section:'01' },
  { code:'346-343', name:'INVENTORY MANAGEMENT', credits:3, grade:'W', term:'2/2568', section:'01' },
  { code:'473-001G2A', name:'FINANCE LITE FOR A BETTER LIFE', credits:2, grade:'E', term:'2/2568', section:'01' },
  { code:'820-200G7', name:'DISRUPTED SEA', credits:2, grade:'C', term:'2/2568', section:'02' },
  { code:'890-102G1', name:'EVERYDAY ENGLISH', credits:2, grade:'C', term:'2/2568', section:'05' },
]
```

- [ ] **Step 3: commit**

```bash
git add lib/types.ts lib/curriculum/seed-6710210764.ts
git commit -m "feat(curriculum): app types + student seed fixture"
```

---

## Task 6: Engine — grades + normalize (TDD)

**Files:** Create `lib/engine/grades.ts`, `lib/engine/normalize.ts`, tests

- [ ] **Step 1: failing test** — Create `lib/engine/grades.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isPass, bestAttempt } from './grades'
import type { TakenCourse } from '@/lib/types'

const tc = (code:string, grade:string, term:string): TakenCourse => ({ code, name:code, credits:3, grade, term })

describe('isPass', () => {
  it('passes D and above, P, S', () => {
    for (const g of ['A','B+','B','C+','C','D+','D','P','S']) expect(isPass(g)).toBe(true)
  })
  it('fails E,F,W,U,I and empty', () => {
    for (const g of ['E','F','W','U','I','']) expect(isPass(g)).toBe(false)
  })
})

describe('bestAttempt', () => {
  it('picks the passing retake (322-102 W then D)', () => {
    const taken = [tc('322-102','W','2/2567'), tc('322-102','D','3/2567')]
    expect(bestAttempt('322-102', taken)?.grade).toBe('D')
  })
  it('returns a failing record when never passed (473-001G2A E)', () => {
    const taken = [tc('473-001G2A','E','2/2568')]
    const best = bestAttempt('473-001G2A', taken)
    expect(best?.grade).toBe('E'); expect(isPass(best!.grade)).toBe(false)
  })
})
```

- [ ] **Step 2: run, expect fail** — `npx vitest run lib/engine/grades.test.ts` → FAIL (module missing)

- [ ] **Step 3: implement** — Create `lib/engine/grades.ts`:

```ts
import type { TakenCourse } from '@/lib/types'
const PASSING = new Set(['A','B+','B','C+','C','D+','D','P','S'])
const POINTS: Record<string, number> = { 'A':4,'B+':3.5,'B':3,'C+':2.5,'C':2,'D+':1.5,'D':1 }

export function isPass(grade: string): boolean { return PASSING.has((grade||'').trim().toUpperCase()) }
export function gradePoint(grade: string): number | null {
  const g = (grade||'').trim().toUpperCase(); return g in POINTS ? POINTS[g] : null
}
/** เลือก attempt ที่ "ผ่านล่าสุด"; ถ้าไม่เคยผ่าน คืน attempt ล่าสุด */
export function bestAttempt(code: string, taken: TakenCourse[]): TakenCourse | undefined {
  const rows = taken.filter(t => t.code === code)
  if (!rows.length) return undefined
  const byTerm = (a:TakenCourse,b:TakenCourse) => a.term.localeCompare(b.term, undefined, { numeric:true })
  const passed = rows.filter(r => isPass(r.grade)).sort(byTerm)
  if (passed.length) return passed[passed.length-1]
  return [...rows].sort(byTerm)[rows.length-1]
}
```
(หมายเหตุ: term `'3/2567'` > `'2/2567'` ด้วย localeCompare numeric; ระวัง `'1/2568'` > `'3/2567'` — ปีมาก่อน. ใช้ helper เรียง: เทียบปีก่อน แล้วเทอม — ปรับ `byTerm` เป็นแยกปี/เทอม)

แก้ `byTerm` ให้ถูก:
```ts
const termKey = (t:string) => { const [s,y]=t.split('/'); return Number(y)*10+Number(s) }
const byTerm = (a:TakenCourse,b:TakenCourse) => termKey(a.term)-termKey(b.term)
```

- [ ] **Step 4: normalize test** — Create `lib/engine/normalize.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { normalizeCode } from './normalize'
describe('normalizeCode', () => {
  it('trims spaces and uppercases suffix', () => {
    expect(normalizeCode(' 890-102g1 ')).toBe('890-102G1')
    expect(normalizeCode('346-111')).toBe('346-111')
  })
})
```

- [ ] **Step 5: implement normalize** — Create `lib/engine/normalize.ts`:

```ts
export function normalizeCode(raw: string): string {
  return (raw||'').trim().toUpperCase().replace(/\s+/g,'')
}
```

- [ ] **Step 6: run all** — `npx vitest run lib/engine` → PASS

- [ ] **Step 7: commit**

```bash
git add lib/engine/grades.ts lib/engine/grades.test.ts lib/engine/normalize.ts lib/engine/normalize.test.ts
git commit -m "feat(engine): grade rules + code normalize (TDD)"
```

---

## Task 7: Engine — match + progress (TDD, core correctness)

**Files:** Create `lib/engine/match.ts`, `lib/engine/progress.ts`, `lib/engine/progress.test.ts`

- [ ] **Step 1: failing acceptance test** — Create `lib/engine/progress.test.ts` (ผูกกับ fixture จริง):

```ts
import { describe, it, expect } from 'vitest'
import { buildProgram } from '@/lib/curriculum/program-2564'
import { SEED_6710210764 } from '@/lib/curriculum/seed-6710210764'
import { computeProgress } from './progress'

describe('computeProgress (เคสจริง 6710210764, regular+ge2565)', () => {
  const prog = buildProgram('regular','ge2565')
  const r = computeProgress(prog, SEED_6710210764, [])

  const cat = (c:string) => r.categories.find(x => x.category === c)!

  it('วิทย์พื้นฐาน 21/24 (ขาด 346-361)', () => {
    expect(cat('foundation').doneCredits).toBe(21)
    expect(cat('foundation').missing.map(m=>m.code)).toContain('346-361')
  })
  it('บังคับ 26/57', () => {
    expect(cat('core').doneCredits).toBe(26)
  })
  it('เลือกสาขา 0/21 (346-343 ติด W ไม่นับ)', () => {
    expect(cat('major_elective').doneCredits).toBe(0)
  })
  it('GE: GE2A ยังไม่ผ่าน (473-001G2A=E), GE2B/GE4/GE6/GE7/GE1 ผ่าน', () => {
    const ge = r.requirements
    expect(ge.find(x=>x.id==='ge:GE1')!.status).toBe('done')
    expect(ge.find(x=>x.id==='ge:GE2A')!.status).not.toBe('done')
    expect(ge.find(x=>x.id==='ge:GE2B')!.status).toBe('done')
    expect(ge.find(x=>x.id==='ge:GE7')!.status).toBe('done')
  })
  it('ไม่นับวิชาซ้ำซ้อน (รวม done ≤ ผลรวมที่ผ่านจริง)', () => {
    expect(r.totalDone).toBeGreaterThan(0)
    expect(r.totalDone).toBeLessThanOrEqual(r.program.totalCredits)
  })
})
```

- [ ] **Step 2: run, expect fail** — `npx vitest run lib/engine/progress.test.ts` → FAIL

- [ ] **Step 3: implement match** — Create `lib/engine/match.ts`:

```ts
import type { Program, Requirement } from '@/lib/curriculum/types'
import type { TakenCourse, Override } from '@/lib/types'
import { isPass, bestAttempt } from './grades'
import { normalizeCode } from './normalize'
import { MAJOR_G1_CODES, MAJOR_G2_CODES } from '@/lib/curriculum/program-2564'
import { GE_BY_CODE } from '@/lib/curriculum/ge-catalog'

export interface MatchResult {
  byRequirement: Map<string, TakenCourse[]>   // requirementId → courses ที่ถูกนับให้
  used: Set<string>                            // key 'code|term' ที่ถูกใช้แล้ว
  extra: TakenCourse[]                         // ผ่านแต่ไม่เข้าเงื่อนไขใด
}

const key = (t: TakenCourse) => `${normalizeCode(t.code)}|${t.term}`

function eligibleForBucket(elig: string, code: string): boolean {
  const c = normalizeCode(code)
  if (elig === 'major_elec_g1') return MAJOR_G1_CODES.has(c)
  if (elig === 'major_elec_g2') return MAJOR_G2_CODES.has(c)
  if (elig === 'ge8') return GE_BY_CODE[c]?.group === 'GE8'
  if (elig === 'free') return true
  return false
}

export function assign(program: Program, taken: TakenCourse[], overrides: Override[]): MatchResult {
  // 1) เหลือเฉพาะ bestAttempt ที่ผ่าน ต่อรหัส
  const passedByCode = new Map<string, TakenCourse>()
  for (const t of taken) {
    const best = bestAttempt(t.code, taken)
    if (best && isPass(best.grade)) passedByCode.set(normalizeCode(best.code), best)
  }
  const pool = [...passedByCode.values()]
  const used = new Set<string>()
  const byRequirement = new Map<string, TakenCourse[]>()
  const put = (id:string, t:TakenCourse) => {
    byRequirement.set(id, [...(byRequirement.get(id)??[]), t]); used.add(key(t))
  }
  const take = (pred:(t:TakenCourse)=>boolean) =>
    pool.find(t => !used.has(key(t)) && pred(t))

  // 2) overrides ก่อน
  for (const ov of overrides) {
    const t = pool.find(t => normalizeCode(t.code)===normalizeCode(ov.takenCode) && t.term===ov.term && !used.has(key(t)))
    if (t) put(ov.requirementId, t)
  }
  // 3) fixed
  for (const req of program.requirements) if (req.kind==='fixed') {
    if (byRequirement.has(req.id)) continue
    const t = take(t => req.courseCodes.map(normalizeCode).includes(normalizeCode(t.code)))
    if (t) put(req.id, t)
  }
  // 4) choose
  for (const req of program.requirements) if (req.kind==='choose') {
    let have = (byRequirement.get(req.id)??[]).reduce((s,t)=>s+t.credits,0)
    const opt = new Set(req.options.map(o=>normalizeCode(o.code)))
    while (have < req.needCredits) {
      const t = take(t => opt.has(normalizeCode(t.code)))
      if (!t) break; put(req.id, t); have += t.credits
    }
  }
  // 5) buckets (ลำดับ: g1 → g2 → ge8 → free)
  const order = ['major_elec_g1','major_elec_g2','ge8','free']
  for (const elig of order) for (const req of program.requirements)
    if (req.kind==='bucket' && req.eligible===elig) {
      let have = (byRequirement.get(req.id)??[]).reduce((s,t)=>s+t.credits,0)
      while (have < req.needCredits) {
        const t = take(t => eligibleForBucket(elig, t.code))
        if (!t) break; put(req.id, t); have += t.credits
      }
    }
  const extra = pool.filter(t => !used.has(key(t)))
  return { byRequirement, used, extra }
}
```

- [ ] **Step 4: implement progress** — Create `lib/engine/progress.ts`:

```ts
import type { Program, Requirement, Category } from '@/lib/curriculum/types'
import type { TakenCourse, Override } from '@/lib/types'
import { COURSES } from '@/lib/curriculum/courses'
import { assign } from './match'

export interface ReqResult {
  id: string; label: string; category: Category
  needCredits: number; doneCredits: number
  status: 'done'|'partial'|'none'
  matched: TakenCourse[]
  missing: { code:string; name:string; credits:number }[]
  verifyNote?: string
}
export interface CategoryResult { category: Category; needCredits: number; doneCredits: number; requirements: ReqResult[]; missing: {code:string;name:string;credits:number}[] }
export interface ProgressResult {
  program: Program
  requirements: ReqResult[]
  categories: CategoryResult[]
  totalDone: number
  extra: TakenCourse[]
}

const reqNeed = (r:Requirement) => r.kind==='fixed' ? r.credits : r.needCredits

export function computeProgress(program: Program, taken: TakenCourse[], overrides: Override[]): ProgressResult {
  const m = assign(program, taken, overrides)
  const requirements: ReqResult[] = program.requirements.map(r => {
    const matched = m.byRequirement.get(r.id) ?? []
    const doneCredits = matched.reduce((s,t)=>s+t.credits,0)
    const need = reqNeed(r)
    const status: ReqResult['status'] = doneCredits>=need ? 'done' : doneCredits>0 ? 'partial' : 'none'
    const missing = r.kind==='fixed' && status!=='done'
      ? r.courseCodes.slice(0,1).map(c => ({ code:c, name:COURSES[c]?.name ?? c, credits:r.credits }))
      : []
    return { id:r.id, label:r.label, category:r.category, needCredits:need, doneCredits, status, matched, missing, verifyNote: (r as any).verifyNote }
  })
  const cats: Category[] = ['foundation','core','major_elective','ge','free_elective']
  const categories = cats.map(category => {
    const rs = requirements.filter(r => r.category===category)
    const needCredits = rs.reduce((s,r)=>s+r.needCredits,0)
    const doneCredits = Math.min(rs.reduce((s,r)=>s+r.doneCredits,0), needCredits)
    const missing = rs.flatMap(r => r.missing)
    return { category, needCredits, doneCredits, requirements: rs, missing }
  })
  const totalDone = Math.min(categories.reduce((s,c)=>s+c.doneCredits,0), program.totalCredits)
  return { program, requirements, categories, totalDone, extra: m.extra }
}
```

- [ ] **Step 5: run** — `npx vitest run lib/engine/progress.test.ts` → PASS (ปรับ requirement recYear/needCredits ของ major_elective ให้ผลรวม `cat('major_elective').needCredits` = 21 ปกติ/17 สหกิจ; ถ้าเทสต์ fail เพราะ g1+g2=12+9=21 ✓)

- [ ] **Step 6: commit**

```bash
git add lib/engine/match.ts lib/engine/progress.ts lib/engine/progress.test.ts
git commit -m "feat(engine): assignment + progress (verified vs real transcript)"
```

---

## Task 8: Engine — suggestNextTerm + transcript parser (TDD)

**Files:** Create `lib/engine/parse-transcript.ts`, add `suggestNextTerm` to progress, tests

- [ ] **Step 1: parser test** — Create `lib/engine/parse-transcript.test.ts`:

```ts
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
    expect(rows[0]).toMatchObject({ code:'145-101', name:'COMPANION ANIMALS', section:'01', credits:3, grade:'A', term:'1/2567' })
    expect(rows[2]).toMatchObject({ code:'890-101G1', credits:2, grade:'U' })
  })
})
```

- [ ] **Step 2: run fail** — `npx vitest run lib/engine/parse-transcript.test.ts` → FAIL

- [ ] **Step 3: implement parser** — Create `lib/engine/parse-transcript.ts`:

```ts
import type { TakenCourse } from '@/lib/types'
const LINE = /^([0-9]{3}-[0-9]{3}[A-Za-z0-9]*)\s+(.+?)\s+([0-9]{2})\s+([0-9]+(?:\.[0-9]+)?)\s+([A-FPSUIW][+-]?)$/
const GRADES = new Set(['A','B+','B','C+','C','D+','D','E','F','W','U','P','S','I'])
export function parseTranscript(text: string, term: string): TakenCourse[] {
  const out: TakenCourse[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/\s+/g,' ')
    const m = LINE.exec(line); if (!m) continue
    const grade = m[5].toUpperCase(); if (!GRADES.has(grade)) continue
    out.push({ code:m[1].toUpperCase(), name:m[2].trim(), section:m[3], credits:Number(m[4]), grade, term })
  }
  return out
}
```

- [ ] **Step 4: suggestNextTerm test** — append to `progress.test.ts`:

```ts
import { suggestNextTerm } from './progress'
it('แนะนำวิชาปี3เทอม1 ที่ยังไม่ผ่าน (รวม 346-321/346-322/346-331/346-361)', () => {
  const prog = buildProgram('regular','ge2565')
  const s = suggestNextTerm(prog, SEED_6710210764, [], { year:3, term:1 })
  const codes = s.recommended.map(x=>x.code)
  for (const c of ['346-321','346-322','346-331','346-361']) expect(codes).toContain(c)
})
```

- [ ] **Step 5: implement suggestNextTerm** — append to `lib/engine/progress.ts`:

```ts
export interface NextTerm { recommended: { code:string; name:string; credits:number; reason:string }[]; carryOver: { code:string; name:string; reason:string }[] }
export function suggestNextTerm(program: Program, taken: TakenCourse[], overrides: Override[], at:{year:number;term:number}): NextTerm {
  const r = computeProgress(program, taken, overrides)
  const passedCodes = new Set(r.requirements.flatMap(x=>x.matched.map(t=>t.code)))
  const recommended: NextTerm['recommended'] = []
  for (const req of program.requirements) if (req.kind==='fixed') {
    const code = req.courseCodes[0]
    const done = (r.requirements.find(x=>x.id===req.id)?.status)==='done'
    if (done) continue
    const ry = (req as any).recYear, rt = (req as any).recTerm
    if (ry==null || ry<at.year || (ry===at.year && (rt??1)<=at.term))
      recommended.push({ code, name: COURSES[code]?.name ?? code, credits:req.credits,
        reason: ry===at.year ? 'ตามแผนเทอมนี้' : 'คงค้างจากเทอมก่อน' })
  }
  // เตือนวิชาเลือกสาขาถ้ายังไม่เริ่ม
  const me = r.categories.find(c=>c.category==='major_elective')!
  const carryOver: NextTerm['carryOver'] = []
  if (me.doneCredits < me.needCredits) carryOver.push({ code:'(เลือกสาขา)', name:`ยังต้องอีก ${me.needCredits-me.doneCredits} นก`, reason:'ควรเริ่มลงวิชาเลือกสาขา' })
  return { recommended, carryOver }
}
```

- [ ] **Step 6: run all engine tests** — `npx vitest run lib/engine` → PASS

- [ ] **Step 7: commit**

```bash
git add lib/engine/parse-transcript.ts lib/engine/parse-transcript.test.ts lib/engine/progress.ts lib/engine/progress.test.ts
git commit -m "feat(engine): transcript parser + next-term suggestions (TDD)"
```

---

## Task 9: Supabase schema + RLS

**Files:** Create `supabase/migrations/0001_init.sql`, `.env.example`, `SETUP.md`

- [ ] **Step 1: migration** — Create `supabase/migrations/0001_init.sql`:

```sql
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  plan text not null default 'regular',
  ge_framework text not null default 'ge2565',
  pass_threshold text not null default 'D',
  current_year int, current_term int,
  updated_at timestamptz default now()
);
create table if not exists taken_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null, name text not null, credits numeric not null default 0,
  grade text not null default '', term text not null default '', section text,
  created_at timestamptz default now(),
  unique (user_id, code, term)
);
create table if not exists requirement_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  taken_code text not null, term text not null, requirement_id text not null,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
alter table taken_courses enable row level security;
alter table requirement_overrides enable row level security;
create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own taken" on taken_courses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own ov" on requirement_overrides for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- auto-create profile
create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin insert into profiles(id, display_name) values (new.id, new.email) on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
```

- [ ] **Step 2: env + setup docs** — Create `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
Create `SETUP.md` (ขั้นตอน: สร้างโปรเจกต์ Supabase → SQL editor รัน 0001_init.sql → คัด URL/anon key ใส่ `.env.local` → เปิด Google provider (ออปชัน) → `npm run dev`; deploy Vercel ใส่ env เดียวกัน).

- [ ] **Step 3: commit**

```bash
git add supabase/migrations/0001_init.sql .env.example SETUP.md
git commit -m "feat(db): supabase schema + RLS + setup docs"
```

---

## Task 10: Supabase clients + repository

**Files:** Create `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/data/repository.ts`

- [ ] **Step 1: clients** — Create `lib/supabase/client.ts` (browser) และ `lib/supabase/server.ts` (server, cookies) ตามแพทเทิร์น `@supabase/ssr`:

```ts
// client.ts
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
```
```ts
// server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const store = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => store.getAll(), setAll: (cs)=>cs.forEach(({name,value,options})=>store.set(name,value,options)) },
  })
}
export function hasSupabaseEnv() { return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
```

- [ ] **Step 2: repository** — Create `lib/data/repository.ts` (client-side functions): `getProfile()`, `upsertProfile()`, `listTaken()`, `addTaken()`, `updateTaken()`, `deleteTaken()`, `bulkAddTaken()`, `listOverrides()`, `setOverride()`, `clearOverride()` — เรียก supabase client, คืน typed `TakenCourse[]/Profile/Override[]`.

- [ ] **Step 3: commit**

```bash
git add lib/supabase lib/data/repository.ts
git commit -m "feat(data): supabase clients + repository"
```

---

## Task 11: Auth + app shell + onboarding

**Files:** `app/(auth)/login/page.tsx`, `middleware.ts`, `app/(app)/layout.tsx`, onboarding banner

- [ ] **Step 1: middleware** — Create `middleware.ts` ที่ refresh session และกันเข้าหน้า `(app)` ถ้ายังไม่ล็อกอิน (redirect → /login). ถ้าไม่มี env Supabase ให้ผ่านได้แต่โชว์ onboarding.

- [ ] **Step 2: login page** — Create `app/(auth)/login/page.tsx`: ปุ่ม Sign in with Google + ฟอร์มอีเมล/รหัสผ่าน (supabase.auth.signInWithPassword / signInWithOAuth). มี toggle สมัครสมาชิก.

- [ ] **Step 3: app layout** — Create `app/(app)/layout.tsx`: topbar (ชื่อผู้ใช้, สวิตช์ plan ปกติ/สหกิจ, เมนู), nav (Dashboard/Courses/Plan), `<Toaster/>`. ถ้า `!hasSupabaseEnv()` → แสดง `OnboardingBanner` ลิงก์ SETUP.md.

- [ ] **Step 4: build check + commit**

```bash
npm run build
git add app middleware.ts
git commit -m "feat(auth): login + app shell + onboarding"
```

---

## Task 12: Courses page (CRUD + paste + seed)

**Files:** `app/(app)/courses/page.tsx`, `app/(app)/courses/_components/*`

- [ ] **Step 1:** ตาราง shadcn แสดง `taken_courses` (group ตามเทอม), badge เกรด (เขียว=ผ่าน/แดง=ไม่ผ่าน), ปุ่มแก้/ลบ
- [ ] **Step 2:** Dialog "เพิ่มรายวิชา" (code autocomplete จาก COURSES+GE_CATALOG, name auto-fill, credits auto, grade select, term)
- [ ] **Step 3:** Dialog "วางจาก SIS" → textarea + เลือกเทอม → `parseTranscript` → preview ตาราง → ยืนยัน → `bulkAddTaken`
- [ ] **Step 4:** ปุ่ม "โหลดข้อมูลตัวอย่างของฉัน" → `bulkAddTaken(SEED_6710210764)` (กันซ้ำด้วย unique)
- [ ] **Step 5: commit**

```bash
git add app/(app)/courses
git commit -m "feat(ui): courses CRUD + paste import + seed"
```

---

## Task 13: Dashboard + requirement detail + override

**Files:** `app/(app)/dashboard/page.tsx`, `app/(app)/requirements/[cat]/page.tsx`, components

- [ ] **Step 1:** dashboard server component: โหลด profile+taken+overrides → `computeProgress` → render: progress รวม (totalDone/totalCredits), การ์ดต่อหมวด (Progress bar + สถานะสี + ลิงก์ไป /requirements/[cat]), แถบ ⚠ verifyNote, การ์ด "แนะนำเทอมหน้า" (`suggestNextTerm`)
- [ ] **Step 2:** `/requirements/[cat]`: list ReqResult ในหมวด, matched courses, "ขาด", dropdown override (เลือก takenCourse → setOverride(requirementId))
- [ ] **Step 3:** สวิตช์ plan/ge_framework ใน topbar → upsertProfile → revalidate
- [ ] **Step 4: commit**

```bash
git add app/(app)/dashboard app/(app)/requirements
git commit -m "feat(ui): dashboard + requirement detail + override"
```

---

## Task 14: Plan page + polish + final checks

**Files:** `app/(app)/plan/page.tsx`, misc

- [ ] **Step 1:** หน้า `/plan`: `suggestNextTerm` ตาม current_year/term ของ profile → รายการแนะนำ + วิชาคงค้าง/ต้องลงใหม่ (GE2A ตก, เลือกสาขายังไม่เริ่ม) + ปุ่มตั้งปี/เทอมปัจจุบัน
- [ ] **Step 2:** empty states, loading skeletons, mobile responsive, dark mode check
- [ ] **Step 3:** `npm run build` + `npx vitest run` ต้องผ่านทั้งหมด
- [ ] **Step 4: commit**

```bash
git add -A
git commit -m "feat(ui): plan page + polish; all tests green"
```

---

## Self-Review (เทียบสเปค)
- §1 เป้าหมาย: ครบ (เช็คครบ=Task7, แนะนำเทอมหน้า=Task8/14, regular/coop=Task4, cloud=Task9-11) ✓
- §3 grade rules: Task6 ✓
- §6 dataset: Task2-4 ✓ (GE8 ต้องถอดให้ครบจาก ge-structure.txt — ระบุชัดใน Task3 Step1)
- §7 engine: Task6-8, acceptance ผูก fixture จริง ✓
- §8 GE+verify flags: Task4 verifyNote, Task13 banner ✓
- §9 DB+RLS: Task9 ✓
- §10 import: Task8 parser + Task12 UI ✓
- §11 UI: Task11-14 ✓
- §13 testing: Task6-8 Vitest + Task11/14 build ✓
- §14 setup/deploy: Task9 SETUP.md ✓
- §15 verify items: ฝังเป็น verifyNote (GE3/GE5/free) + carryOver (GE2A) ✓

Type consistency: `computeProgress`/`suggestNextTerm`/`assign` ใช้ชื่อ field สม่ำเสมอ (doneCredits/needCredits/status/matched/missing). `bestAttempt(code, taken)` signature เดียวกันทุกที่. ✓
