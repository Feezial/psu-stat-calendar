# PSU Stat Curriculum Checker — Design Spec

วันที่: 2026-06-07
หลักสูตรอ้างอิง: **วิทยาศาสตรบัณฑิต สาขาวิชาสถิติ (วท.บ. สถิติ) — ม.อ. วิทยาเขตหาดใหญ่ — หลักสูตรปรับปรุง พ.ศ. 2564**

---

## 1. เป้าหมาย (Goals)
เว็บแอปช่วยนักศึกษา วท.บ. สถิติ:
1. บันทึกรายวิชาที่เรียนผ่านมา (seed จาก transcript + เพิ่ม/แก้/วางทับ paste)
2. เช็คอัตโนมัติว่า **เรียนครบหมวดไหน / ขาดวิชาอะไร** เทียบหลักสูตร 2564
3. **แนะนำวิชาที่ควรลงเทอมหน้า** (อิงแผนการเรียนปี/เทอม + วิชาที่ยังขาด)
4. รองรับ **แผนปกติและแผนสหกิจ** สลับได้
5. ข้อมูลผูกกับ **บัญชีผู้ใช้ + ฐานข้อมูลคลาวด์** (Supabase) ใช้ข้ามเครื่องได้

### ไม่อยู่ในขอบเขต (Out of scope)
- ❌ จัดตารางเรียนรายสัปดาห์ / ตรวจเวลาเรียนชนกัน (timetable scheduler)
- ❌ ดึงข้อมูลจาก SIS อัตโนมัติ (กรอก/วางเอง)
- ❌ คำนวณ GPA แบบเป๊ะตามระเบียบ (แสดง GPA จาก transcript ได้ แต่ไม่ใช่ฟีเจอร์หลัก)

## 2. ผู้ใช้และเกณฑ์ความสำเร็จ
- ผู้ใช้หลัก: นักศึกษาสถิติ ม.อ. (เริ่มจากเจ้าของ รหัส 6710210764 แต่ออกแบบให้คนอื่นใช้ได้)
- สำเร็จเมื่อ: ล็อกอิน → เห็น dashboard ความคืบหน้า/หมวด → เห็นรายการ "ขาด" ถูกต้อง → เห็นคำแนะนำเทอมหน้า → แก้ไขรายวิชาแล้วผลอัปเดต และข้อมูลถูกเก็บข้ามเครื่อง
- Acceptance: เคสจริงของเจ้าของต้องได้ผล **วิชาเฉพาะ: วิทย์พื้นฐาน 21/24, บังคับ 26/57, เลือกสาขา 0/21** และ GE flag จุดที่ต้องยืนยันได้ถูกต้อง (ดู §8, §12)

## 3. เกณฑ์ผ่าน (Grade rules)
- ผ่าน = เกรด **D, D+, C, C+, B, B+, A** หรือ **P / S** (สำหรับวิชา P/F)
- ไม่ผ่าน = **E, F, W, U, I, IP** (และค่าว่าง)
- รายวิชาเดียวกันลงหลายครั้ง → ใช้ผลครั้งที่ **ผ่านล่าสุด**; ถ้าไม่เคยผ่าน → ถือว่ายังไม่ผ่าน (แนะนำให้ลงใหม่)
- วิชา audit/ไม่นับหน่วยกิต (เช่น 890-101G1 สรรสาระภาษาอังกฤษ) ไม่นับรวมหน่วยกิต แต่ track สถานะแยก (อาจต้อง "ผ่าน/เคลียร์")

## 4. สแตก (Tech stack)
- **Next.js 15 (App Router, TypeScript)** + **React 19**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase**: Auth (อีเมล/รหัสผ่าน + Google OAuth) + Postgres + Row Level Security
- เครื่องมือ: ESLint/Prettier, **Vitest** (unit test เอนจิน), pnpm/npm
- Deploy: **Vercel** + Supabase (ทั้งคู่มี free tier); ผมจัดทำ SQL migration + `.env.example` + `SETUP.md`

## 5. สถาปัตยกรรม (Architecture)
แยกเป็นชั้นชัดเจน ทดสอบแยกได้:

```
app/                      # Next.js App Router (UI + route handlers)
  (auth)/login            # หน้า login (Supabase Auth UI)
  (app)/dashboard         # ภาพรวม
  (app)/courses           # รายวิชาที่เรียนแล้ว (เพิ่ม/แก้/paste)
  (app)/requirements/[cat]# รายละเอียดแต่ละหมวด + override
  (app)/plan              # คำแนะนำเทอมหน้า
lib/
  curriculum/             # ★ ข้อมูลหลักสูตร (static, ไม่มี state) — §6
    program-2564.ts       #   โครงสร้างหมวด/เงื่อนไข + แผนปี/เทอม
    courses.ts            #   master list รหัส→ชื่อ/หน่วยกิต (รวม alias)
    ge-catalog.ts         #   แคตตาล็อก GE1–8 (จาก research/ge-structure.txt)
  engine/                 # ★ เอนจินบริสุทธิ์ (pure functions, ทดสอบหนัก) — §7
    grades.ts             #   isPass(), bestAttempt()
    match.ts              #   assignCoursesToRequirements()
    progress.ts           #   computeProgress(), missing(), suggestNextTerm()
    parse-transcript.ts   #   parser ข้อความ SIS → TakenCourse[]
  data/                   # ชั้นเข้าถึงข้อมูลผู้ใช้ (Supabase)
    repository.ts         #   CRUD taken_courses / profile / overrides
  supabase/               #   client (browser + server), types
components/               # shadcn-based UI components
docs/, research/          # สเปค + ข้อมูลดิบหลักสูตร
```

หลักการ: **`lib/curriculum` + `lib/engine` ไม่พึ่ง React/Supabase เลย** → ทดสอบด้วย Vitest ได้ 100% และเป็นแหล่งความถูกต้องเดียว UI แค่ render ผลลัพธ์

## 6. ข้อมูลหลักสูตร (Curriculum dataset — static)
รวม **132 นก (ค่าเริ่มต้น GE1–8)** = วิชาเฉพาะ 102 + GE 24 + เลือกเสรี 6 (สลับเป็น 138/GE สาระ-30 ได้)

### 6.1 วิชาเฉพาะ — 102 นก (จาก มคอ.2, ชัดเจน)
**2.1 วิทย์พื้นฐาน 24 (บังคับทุกตัว):** 322-101(3), 322-102(3), 324-101(3), 325-101(1), 330-101(3), 331-101(1), 332-101(3), 333-101(1), 346-111(3), 346-361(3)

**2.2 บังคับ 57(ปกติ)/61(สหกิจ):** 346-161(3),346-221(3),346-222(3),346-223(3),346-231(3),346-232(4),346-241(5),346-261(2),346-321(3),346-322(3),346-331(3),346-332(3),346-333(3),346-334(3),346-351(3),346-441(3),346-451(3),346-471(1),346-491(1),346-492(2 *เฉพาะปกติ*) ; **สหกิจ:** ตัด 346-492 ออก เพิ่ม 346-472(6)

**2.3 วิชาเลือก 21(ปกติ)/17(สหกิจ):**
- กลุ่ม1 ≥12 นก จากภาควิชาคณิต-สถิติ: 346-335,336,341,342,343,344(7),371(1),431,432,442,443,444,445,481(2),482, 322-201,322-252(5),322-322,322-324,322-355
- กลุ่ม2 ≤9(ปกติ)/5(สหกิจ) จากคณะ/ภาควิชาอื่น: 225-355, 308-231/232/233/311/352, 344-212/312/334, 345-211, 460-101, 460-202(7), 476-201, 542-261, 876-102, 875-309(4)

### 6.2 ศึกษาทั่วไป — ค่าเริ่มต้น GE1–8 (กลาง 2565) 24 นก
บังคับ GE1–7 = 18, เลือก GE8 ≥ 6
- GE1 ภาษา (4): เลือก 2 วิชาจาก 890-102G1..105G1 (890-101G1 = audit ไม่นับ)
- GE2 (4) = GE2A ตรรกะ/ตัวเลข (2) + GE2B คิดเชิงระบบ (2)
- GE3 ผู้ประกอบการ (2) · GE4 ดิจิทัล (2) · GE5 สุขภาวะ (2) · GE6 จิตสาธารณะ/ยั่งยืน (2) · GE7 ปรับตัวพลวัตโลก (2)
- GE8 วิชาเลือก (≥6): จากแคตตาล็อกใหญ่ (รวมสุนทรียศาสตร์/กีฬา/มนุษย์ฯ/ภาษา/วิทย์)
- เก็บแคตตาล็อก GE แต่ละกลุ่ม (รหัส→ชื่อ→กลุ่ม→หน่วยกิต) ใน `ge-catalog.ts` เพื่อ auto-map + dropdown
- **โครงทางเลือก "สาระ 1–7 (2564, 30 นก)"** เก็บเป็นอีก preset หนึ่ง สลับใน settings

### 6.3 เลือกเสรี — 6 นก
bucket: รายวิชาใด ๆ ที่ผ่าน และยังไม่ถูกใช้ในหมวดอื่น (รวมวิชา GE ส่วนเกินได้) — มีธง ⚠ ให้ยืนยัน

### 6.4 แผนการเรียนปี/เทอม (สำหรับคำแนะนำ)
แต่ละวิชาในหลักสูตรมี field `recommendedYear`, `recommendedTerm`, และ `prereq?: string[]` (เท่าที่มีใน มคอ.2) เพื่อขับ §7.4

## 7. เอนจินเช็คครบ (Requirement engine)
### 7.1 ชนิดเงื่อนไข (Requirement)
```ts
type Requirement =
 | { kind:'fixed';  id; category; label; courseCodes:string[]; credits:number } // วิชาบังคับเจาะจง (codeใด codeหนึ่งใน alias = ผ่าน)
 | { kind:'choose'; id; category; label; options:{code;credits}[]; needCredits:number } // เลือกให้ครบ X นก จากลิสต์
 | { kind:'bucket'; id; category; label; needCredits:number; eligible:(c:TakenCourse)=>boolean } // เลือกเสรี/เลือกสาขา/GE8/เลือกต่างคณะ
```
หมวด (category): `foundation | core | major_elective | ge | free_elective`

### 7.2 การจับคู่ (assignment) — วิชา 1 ตัวนับครั้งเดียว
อัลกอริทึม greedy ตามลำดับความเฉพาะเจาะจง:
1. normalize รหัส (ตัด section, map alias G-code ↔ รหัสหลักสูตร, รวม retake → bestAttempt)
2. คัดเฉพาะวิชาที่ **ผ่าน**
3. จับ **fixed** ก่อน (วิชาที่ตรงรหัสบังคับ ล็อกไว้)
4. จับ **choose** (เลือกให้ครบ needCredits)
5. ที่เหลือไหลเข้า **bucket** ตามลำดับความจำกัด: major_elective กลุ่ม1 → กลุ่ม2 → GE8 → free_elective
6. **override ของผู้ใช้** มีสิทธิ์เหนือ greedy (ผูกวิชา X ไป requirement Y ได้)
7. วิชาที่เหลือ/ผ่านแต่ไม่เข้าเงื่อนไขใด = "เกินหลักสูตร" (แสดงแยก)

### 7.3 ผลลัพธ์ (computeProgress)
ต่อ requirement: `{ doneCredits, needCredits, status: done|partial|none, matched:[], missingHint }`
รวมหมวด + รวมทั้งหลักสูตร (X/132) + รายการ "ขาด" + ธง ⚠ verify

### 7.4 แนะนำเทอมหน้า (suggestNextTerm)
input: ปีปัจจุบันของผู้ใช้ + แผน(ปกติ/สหกิจ)
logic: หาวิชา "ยังไม่ผ่าน" ที่ `recommendedYear/Term` ≤ เทอมถัดไป, prereq ครบแล้ว → จัดกลุ่มเป็นรายการแนะนำ + เตือนวิชาคงค้างจากเทอมก่อน (เช่น GE2A ที่ตก, เลือกสาขาที่ยังไม่เริ่ม)

## 8. การจัดการ GE (สำคัญ — มีความกำกวมเชิงระบบ)
- ม.อ. อยู่ช่วงเปลี่ยน GE (หลักสูตรสถิติ 2564 = สาระ30นก ↔ GE กลาง 2565 = GE1–8 24นก) → **default = GE1–8** ตามที่ผู้ใช้เลือก, สลับ preset ได้
- auto-map รหัส G-suffix เข้ากลุ่มด้วย `ge-catalog.ts`
- ทุก requirement GE มี `verifyNote?` แสดงธง ⚠ เมื่อ match แบบกำกวม เช่น:
  - GE3/GE5 ที่ผู้ใช้ลงรหัสเก่า 1 นก (460-001, 388-100) → "อาจไม่ครบตามเกณฑ์ 2565 (ต้องการ 2 นก) — ยืนยันกับอาจารย์ที่ปรึกษา/SIS"
  - เลือกเสรีที่ดึงจาก GE ส่วนเกิน → "ยืนยันว่านับเป็นเลือกเสรีได้"
- ผู้ใช้ override/ปักหมุดเองได้ทุกช่อง

## 9. โครงสร้างฐานข้อมูล (Supabase / Postgres)
```sql
profiles(           id uuid PK = auth.uid, display_name text,
                    plan text default 'regular',          -- 'regular'|'coop'
                    ge_framework text default 'ge2565',   -- 'ge2565'|'core2564'
                    pass_threshold text default 'D',
                    current_year int, current_term int, updated_at )
taken_courses(      id uuid PK, user_id uuid FK->auth.users,
                    code text, name text, credits numeric, grade text,
                    term text,            -- เช่น '1/2567'
                    section text, created_at, UNIQUE(user_id, code, term) )
requirement_overrides( id uuid PK, user_id uuid FK, taken_course_id uuid FK,
                    requirement_id text, created_at )
```
**RLS:** ทุกตารางเปิดเฉพาะ `user_id = auth.uid()` (select/insert/update/delete). `profiles` auto-create เมื่อ sign-up (trigger)

## 10. นำเข้าข้อมูล (Transcript import)
- **Seed:** ปุ่ม "โหลดตัวอย่าง/ข้อมูลของฉัน" ใส่ 5 เทอมของเจ้าของ (รหัส 6710210764) — เก็บเป็น fixture `lib/curriculum/seed-6710210764.ts` (ใช้เป็น test fixture ด้วย)
- **Paste parser** (`parse-transcript.ts`): วางข้อความจาก SIS (รูปแบบ `รหัส ชื่อ ตอน หน่วยกิต เกรด`) → regex แยกเป็น `TakenCourse[]` → preview ให้ผู้ใช้ยืนยันก่อนบันทึก; ข้ามหัวตาราง/บรรทัดสรุป; รองรับเกรด A..F, D+, C+, B+, W, E, P, U, I
- **Manual:** ฟอร์มเพิ่ม/แก้/ลบรายวิชา (autocomplete จาก master list)

## 11. UI / หน้าจอ
- **Login** — Supabase Auth (อีเมล + Google)
- **Dashboard** — progress รวม (X/132), การ์ดต่อหมวด (สี: เขียวครบ/เหลืองบางส่วน/แดงยังไม่เริ่ม), แถบ ⚠ verify, การ์ด "แนะนำเทอมหน้า", สวิตช์แผนปกติ/สหกิจ
- **Courses** — ตารางรายวิชาที่เรียนแล้ว + เพิ่ม/แก้/ลบ + ปุ่ม paste + seed
- **Requirements/[cat]** — ลิสต์ requirement ในหมวด, วิชาที่ match, ช่อง "ขาด", dropdown override
- **Plan** — รายการแนะนำเทอมหน้า + วิชาคงค้าง/ที่ต้องลงใหม่
- Responsive, ภาษาไทยเป็นหลัก, รองรับ dark mode (shadcn)

## 12. Error handling & edge cases
- ยังไม่ตั้ง env Supabase → หน้า onboarding บอกวิธีตั้งค่า (ไม่ crash)
- รหัสซ้ำ/เทอมซ้ำ → upsert ด้วย UNIQUE(user_id,code,term)
- retake/summer (เทอม 3) → bestAttempt เลือกครั้งผ่านล่าสุด
- วิชานอกหลักสูตร (เช่น 145-101) → แสดงในกลุ่ม "เกิน/เลือกเสรี"
- เกรด W/E/U/I → ไม่นับ + แสดง badge "ไม่ผ่าน/ลงใหม่"
- ข้อมูล paste เพี้ยน → preview + ให้แก้ก่อน commit
- offline/sync error → toast + retry, ไม่ทำข้อมูลหาย

## 13. การทดสอบ (Testing)
- **Vitest unit ที่เอนจิน** (สำคัญสุด) ด้วย fixture transcript จริงของเจ้าของ:
  - `isPass` / `bestAttempt` (322-102: W→W→D = ผ่าน; 890-102G1: E→C = ผ่าน; 473-001G2A: E = ไม่ผ่าน)
  - assignment ไม่ double-count
  - ผลรวมหมวด: foundation 21/24 (ขาด 346-361), core 26/57, major_elective 0/21
  - GE: GE1✓ GE2A✗ GE2B✓ GE4✓ GE6✓ GE7✓ GE8✓ + flag GE3/GE5
  - regular vs coop ให้ตัวเลขถูก
- **parse-transcript**: snapshot test กับข้อความ 5 เทอม
- Smoke test หน้า build ได้, lint ผ่าน

## 14. Setup / Deploy
- `SETUP.md`: สร้างโปรเจกต์ Supabase → รัน `supabase/migrations/*.sql` → คัด URL/anon key ใส่ `.env.local` → (ออปชัน) ตั้ง Google OAuth → `npm run dev` ; deploy Vercel + ใส่ env เดียวกัน

## 15. รายการต้องยืนยัน (ส่งต่อให้ผู้ใช้/อาจารย์)
1. หลักสูตรรหัส 67 audit ด้วย GE1–8 (132) หรือ สาระ-30 (138)?
2. GE2A: 473-001G2A ตก → ต้องลงกลุ่ม GE2A ใหม่ (เช่น 142-010G2A, 315-100G2A, 322-100G2A, หรือ 473-001G2A)
3. GE3: 460-001 (1นก) เพียงพอไหม หรือต้อง 460-001G3 (2นก)
4. GE5: 388-100 (1นก,P) เพียงพอไหม หรือต้อง 388-100G5 (2นก)
5. เลือกเสรีดึงจาก GE ส่วนเกินได้จริงไหม
6. 890-101G1 (U) ต้องเคลียร์ไหม

## 16. ลำดับการสร้าง (สำหรับ implementation plan)
A. scaffold Next.js+TS+Tailwind+shadcn+Supabase + .env + migrations
B. `lib/curriculum` (program-2564, courses, ge-catalog, seed fixture)
C. `lib/engine` (grades, match, progress, parse-transcript) + Vitest ครบ
D. `lib/data` repository + Supabase client + RLS
E. Auth + onboarding
F. หน้า Courses (CRUD + paste + seed)
G. หน้า Dashboard + Requirements detail + override
H. หน้า Plan (แนะนำเทอมหน้า)
I. ขัดเกลา UX, verify flags, SETUP.md, deploy guide
