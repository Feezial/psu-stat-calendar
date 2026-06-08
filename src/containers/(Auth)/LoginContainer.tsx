'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, hasSupabaseEnv } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react'
import { AuthShell } from '@/components/(Auth)/AuthShell'

/** โลโก้ Google สีจริง (inline เพื่อไม่ต้องพึ่ง asset ภายนอก) */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  )
}

const STRENGTH = [
  null,
  { label: 'อ่อนมาก', bar: 'bg-red-500', text: 'text-red-600' },
  { label: 'อ่อน', bar: 'bg-orange-500', text: 'text-orange-600' },
  { label: 'แข็งแรง', bar: 'bg-green-500', text: 'text-green-600' },
  { label: 'แข็งแรงมาก', bar: 'bg-emerald-600', text: 'text-emerald-700' },
] as const

/** คะแนนความแข็งแรงรหัสผ่าน 1–4 (0 = ว่าง) — อิงความยาว + ความหลากหลายของตัวอักษร */
function pwScore(pw: string): number {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length
  if (kinds >= 2) s++
  if (kinds >= 3) s++
  return Math.min(4, Math.max(1, s))
}

export default function LoginPage() {
  const router = useRouter()
  const envOk = hasSupabaseEnv()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const score = pwScore(password)

  if (!envOk) {
    return (
      <AuthShell>
        <div className="flex items-center gap-3.5">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-500/12 text-amber-600 ring-1 ring-amber-500/25">
            <ShieldAlert className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-base font-semibold tracking-tight">ยังไม่ได้ตั้งค่า Supabase</h1>
            <p className="text-sm text-muted-foreground">เว็บนี้ต้องเชื่อม Supabase ก่อนใช้งาน</p>
          </div>
        </div>
        <div className="mt-6 space-y-3 text-sm">
          <p>
            ทำตามขั้นตอนในไฟล์{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">SETUP.md</code>:
          </p>
          <ol className="space-y-2.5">
            <li className="flex gap-2.5 text-muted-foreground">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[0.7rem] font-semibold text-secondary-foreground">1</span>
              <span className="pt-px leading-relaxed">สร้างโปรเจกต์ที่ supabase.com</span>
            </li>
            <li className="flex gap-2.5 text-muted-foreground">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[0.7rem] font-semibold text-secondary-foreground">2</span>
              <span className="pt-px leading-relaxed">
                รัน <code className="font-mono text-xs">supabase/migrations/0001_init.sql</code>
              </span>
            </li>
            <li className="flex gap-2.5 text-muted-foreground">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[0.7rem] font-semibold text-secondary-foreground">3</span>
              <span className="pt-px leading-relaxed">
                ใส่ค่า URL / anon key ใน <code className="font-mono text-xs">.env.local</code> แล้วรีสตาร์ท
              </span>
            </li>
          </ol>
        </div>
      </AuthShell>
    )
  }

  async function emailAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('สมัครสำเร็จ! ถ้าระบบให้ยืนยันอีเมล โปรดเช็คกล่องจดหมาย')
        router.push('/dashboard')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  async function googleAuth() {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) toast.error(error.message)
  }

  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-inset ring-white/10">
          <GraduationCap className="size-7" strokeWidth={1.75} />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">PSU Stat Checker</h1>
        <p className="mt-1 text-sm text-muted-foreground">เช็คหน่วยกิตหลักสูตรสถิติ ม.อ.</p>
      </div>

      <div className="relative mt-6 flex rounded-xl bg-muted/70 p-1">
        <span
          aria-hidden
          className={cn(
            'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-card shadow-sm transition-transform duration-300 ease-out',
            mode === 'signup' && 'translate-x-full'
          )}
        />
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            data-active={mode === m}
            className="relative z-10 h-9 flex-1 rounded-lg text-sm font-medium text-foreground/60 transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none data-[active=true]:text-foreground"
          >
            {m === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        ))}
      </div>


      <form onSubmit={emailAuth} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">อีเมล</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@psu.ac.th"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              required
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl pr-10 pl-9"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              className="absolute top-1/2 right-2.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {mode === 'signup' && password.length > 0 && (
            <div className="space-y-1.5 pt-1" aria-live="polite">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-colors duration-300',
                      i <= score ? STRENGTH[score]!.bar : 'bg-border'
                    )}
                  />
                ))}
              </div>
              <p className={cn('text-xs font-medium', STRENGTH[score]!.text)}>
                ความปลอดภัย: {STRENGTH[score]!.label}
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full gap-2 rounded-xl text-[0.9rem] font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              กำลังดำเนินการ…
            </>
          ) : (
            <span key={mode} className="animate-in fade-in duration-300">
              {mode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </span>
          )}
        </Button>
      </form>

      <p
        key={mode}
        className="mt-5 text-center text-xs leading-relaxed text-muted-foreground animate-in fade-in duration-300"
      >
        {mode === 'signin' ? 'ยังไม่มีบัญชี? ' : 'มีบัญชีอยู่แล้ว? '}
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {mode === 'signin' ? 'สมัครสมาชิกใหม่' : 'เข้าสู่ระบบ'}
        </button>
      </p>
    </AuthShell>
  )
}
