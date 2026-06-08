# Deploy ขึ้น Railway

> Railway รัน **เว็บ Next.js** เท่านั้น — **ฐานข้อมูล/Auth ต้องใช้ Supabase Cloud** (Supabase ในเครื่อง/Docker ใช้กับ Railway ไม่ได้)

---

## ขั้นที่ 1 — ตั้ง Supabase Cloud (ทำครั้งเดียว)
1. ไป https://supabase.com → **New project** (ตั้งชื่อ + รหัสผ่าน DB + region Singapore)
2. **SQL Editor** → วางเนื้อหา [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**
3. **Authentication → Sign In / Providers → Email** → ปิด **"Confirm email"** (ถ้าอยากให้สมัครแล้วใช้ได้เลย) หรือเปิดไว้ก็ได้
4. **Project Settings → API** → คัด **Project URL** และ **anon / publishable key** ไว้ (ใช้ในขั้นที่ 3)

## ขั้นที่ 2 — push โค้ดขึ้น GitHub
```bash
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main      # หรือ master ตามชื่อ branch ของคุณ
```
> `.env.local` ถูก gitignore อยู่แล้ว — key จะไม่หลุดขึ้น GitHub ✅

## ขั้นที่ 3 — สร้าง service บน Railway
1. https://railway.app → **New Project → Deploy from GitHub repo** → เลือก repo นี้
2. Railway ตรวจเจอ Next.js เอง (Nixpacks) — `npm install` → `npm run build` → `npm start`
3. แท็บ **Variables** ของ service ใส่ 2 ค่า:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = <anon/publishable key>
   ```
4. **Settings → Networking → Generate Domain** → ได้ URL เช่น `https://xxx.up.railway.app`

## ขั้นที่ 4 — ผูก domain กับ Supabase Auth (สำคัญ!)
Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://xxx.up.railway.app`
- **Redirect URLs**: เพิ่ม `https://xxx.up.railway.app/**`

(ถ้าจะใช้ **Google login**: ตั้ง Google provider ใน Supabase + ใส่ Authorized redirect URI ของ Supabase ใน Google Cloud Console ด้วย)

เสร็จแล้ว เปิด URL → สมัคร/ล็อกอิน → ใช้งานได้ ✅

---

## หมายเหตุทางเทคนิค (เตรียมไว้ให้แล้ว ไม่ต้องแก้)
- **PORT**: `next start` อ่าน `$PORT` ของ Railway อัตโนมัติ
- **Node**: pin ไว้ `>=20` ใน `package.json` (`engines`) — Railway เลือกเวอร์ชันถูกต้อง
- **pdf.js worker**: `postinstall` คัดไฟล์ worker เข้า `public/` ตอน build อัตโนมัติ
- ถ้า build ล้มเพราะหา devDependencies ไม่เจอ (TypeScript/Tailwind): ตั้ง Railway Variable `NIXPACKS_INSTALL_CMD=npm ci --include=dev`

## สลับ env กลับมา dev ในเครื่อง
`.env.local` ในเครื่องยังชี้ Supabase local อยู่ — ใช้ `npx supabase start` + `npm run dev` ได้เหมือนเดิม
(โปรดักชันบน Railway ใช้ env ของ Railway แยกกัน ไม่กระทบกัน)
