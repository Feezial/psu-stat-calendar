# syntax=docker/dockerfile:1
# Next.js 16 (standalone output) — build & run บน Railway ด้วย Docker
# ใช้ node:20-slim (Debian/glibc) แทน alpine — มี glibc ในตัว ไม่ต้อง apk add libc6-compat
# (เลี่ยงปัญหา alpine ดึง package จาก CDN ไม่ได้ตอน build + sharp/native module ทำงานได้ทันที)

# ---------- 1) deps: ติดตั้ง dependencies (cache layer) ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --include=dev: build ต้องใช้ devDeps (typescript, tailwind, react-compiler)
# --ignore-scripts: ข้าม postinstall ไว้ก่อน (สเตจนี้ยังไม่มีโฟลเดอร์ public/ ให้ copy worker)
RUN npm ci --include=dev --ignore-scripts

# ---------- 2) builder: สร้าง production build ----------
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* ถูก inline เข้า JS bundle ตั้งแต่ตอน `next build` (build-time)
# Railway ส่ง service Variables เข้ามาเป็น build args ให้อัตโนมัติ → ประกาศ ARG ไว้รับ
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

# คัด pdf.js worker เข้า public/ (เทียบเท่า postinstall) แล้ว build
RUN mkdir -p public && npm run postinstall && npm run build

# ---------- 3) runner: image รันจริง (เล็กที่สุด) ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# standalone server ต้องการ public/ และ .next/static เพิ่มเอง (Next ไม่ copy ให้ใน standalone)
# node:20-slim มี user `node` (uid 1000) มาให้แล้ว — รันด้วย non-root เลย
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

# Railway จะ override PORT ตอน runtime; HOSTNAME=0.0.0.0 ให้ bind ทุก interface (จำเป็น)
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
