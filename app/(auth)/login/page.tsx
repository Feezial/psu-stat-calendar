'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, hasSupabaseEnv } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const envOk = hasSupabaseEnv()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!envOk) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>ยังไม่ได้ตั้งค่า Supabase</CardTitle>
            <CardDescription>เว็บนี้ต้องเชื่อม Supabase ก่อนใช้งาน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>ทำตามขั้นตอนในไฟล์ <code className="font-mono">SETUP.md</code>:</p>
            <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>สร้างโปรเจกต์ที่ supabase.com</li>
              <li>รัน <code className="font-mono">supabase/migrations/0001_init.sql</code></li>
              <li>ใส่ค่า URL/anon key ใน <code className="font-mono">.env.local</code> แล้วรีสตาร์ท</li>
            </ol>
          </CardContent>
        </Card>
      </div>
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
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">PSU Stat Checker</CardTitle>
          <CardDescription>เช็คหน่วยกิตหลักสูตรสถิติ ม.อ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* <Button variant="outline" className="w-full" onClick={googleAuth} type="button">
            เข้าสู่ระบบด้วย Google
          </Button> */}
          <div className="relative text-center text-xs text-muted-foreground">
            <span className="bg-card px-2 relative z-10">หรือใช้อีเมล</span>
            <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
          </div>
          <form onSubmit={emailAuth} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">อีเมล</Label>
              <Input id="email" type="email" value={email} required
                onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input id="password" type="password" value={password} required minLength={6}
                onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'กำลังดำเนินการ…' : mode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}{' '}
            <button type="button" className="text-foreground underline"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
