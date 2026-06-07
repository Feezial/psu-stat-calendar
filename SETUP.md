# คู่มือติดตั้ง — PSU Stat Curriculum Checker

เว็บเช็คหน่วยกิตหลักสูตร วท.บ. สถิติ (ม.อ. หาดใหญ่ ปรับปรุง 2564) — Next.js + shadcn/ui + Supabase

## 1) ติดตั้ง dependencies
```bash
npm install
```

## 2) สร้างโปรเจกต์ Supabase (ฟรี)
1. ไปที่ https://supabase.com → New project
2. เมนู **SQL Editor** → วางเนื้อหาไฟล์ [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → Run
   (สร้างตาราง `profiles`, `taken_courses`, `requirement_overrides` + RLS + trigger สร้างโปรไฟล์อัตโนมัติ)
3. เมนู **Project Settings → API** → คัด **Project URL** และ **anon public key**

## 3) ตั้งค่า environment
คัดไฟล์ตัวอย่างแล้วเติมค่า:
```bash
cp .env.example .env.local
```
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## 4) (ออปชัน) เปิดล็อกอินด้วย Google
Supabase → **Authentication → Providers → Google** → ใส่ Client ID/Secret (จาก Google Cloud Console)
ถ้าไม่เปิด ใช้สมัคร/เข้าสู่ระบบด้วยอีเมล+รหัสผ่านได้เลย

## 5) รัน
```bash
npm run dev
```
เปิด http://localhost:3000 → สมัคร/เข้าสู่ระบบ → หน้า **รายวิชา** กดปุ่ม
"โหลดข้อมูลตัวอย่าง" หรือ "วางจาก SIS" เพื่อนำเข้า transcript

## 6) Deploy (Vercel)
1. push ขึ้น GitHub → import ใน https://vercel.com
2. ใส่ env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy — ใช้ Supabase ตัวเดียวกัน ข้อมูลซิงค์ข้ามเครื่องอัตโนมัติ

## ทดสอบเอนจิน
```bash
npm test
```
(unit test ตรวจความถูกต้องด้วย transcript ตัวอย่างจริง: วิทย์พื้นฐาน 21/24, บังคับ 26/57, เลือกสาขา 0/21 ฯลฯ)

## หมายเหตุเรื่อง GE (สำคัญ)
ม.อ. อยู่ช่วงเปลี่ยนระบบ GE — แอปยึด **GE กลาง 2565 (GE1–8, รวม 132 นก)** เป็นค่าเริ่มต้น
จุดที่ระบบขึ้นธง ⚠️ (เช่น GE3/GE5 ที่ลงรหัสเก่า 1 นก, วิชาเลือกเสรีจากหน่วยกิตส่วนเกิน)
**ควรยืนยันกับอาจารย์ที่ปรึกษา/ตรวจสอบใน SIS** ก่อนใช้ตัดสินใจจริง
