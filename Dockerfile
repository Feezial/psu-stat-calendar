# syntax=docker/dockerfile:1
# Next.js 16 (standalone output) — build & run บน Railway ด้วย Docker
# โครงสร้าง 3 สเตจ: deps → builder → runner (image สุดท้ายเล็ก ไม่มี source/devDeps)

# ---------- 1) deps: ติดตั้ง dependencies (cache layer) ----------
FROM node:20-alpine AS deps
# libc6-compat: บาง native module (เช่น sharp ของ next/image) ต้องใช้บน alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
# --include=dev: build ต้องใช้ devDeps (typescript, tailwind, react-compiler)
# --ignore-scripts: ข้าม postinstall ไว้ก่อน (สเตจนี้ยังไม่มีโฟลเดอร์ public/ ให้ copy worker)
RUN npm ci --include=dev --ignore-scripts

# ---------- 2) builder: สร้าง production build ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
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
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# รันด้วย non-root user เพื่อความปลอดภัย
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# standalone server ต้องการ public/ และ .next/static เพิ่มเอง (Next ไม่ copy ให้ใน standalone)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Railway จะ override PORT ตอน runtime; HOSTNAME=0.0.0.0 ให้ bind ทุก interface (จำเป็น)
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
