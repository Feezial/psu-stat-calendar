'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, hasSupabaseEnv } from '@/lib/supabase/client'
import {
  getProfile, listTaken, listOverrides, upsertProfile,
} from '@/lib/data/repository'
import type { TakenCourse, Profile, Override } from '@/lib/types'
import { buildProgram } from '@/lib/curriculum/program-2564'
import { computeProgress, type ProgressResult } from '@/lib/engine/progress'

interface AppDataValue {
  envOk: boolean
  loading: boolean
  email: string | null
  profile: Profile
  taken: TakenCourse[]
  overrides: Override[]
  progress: ProgressResult
  refresh: () => Promise<void>
  saveProfile: (patch: Partial<Profile>) => Promise<void>
}

const DEFAULT_PROFILE: Profile = { plan: 'regular', geFramework: 'ge2565', passThreshold: 'D' }

const Ctx = createContext<AppDataValue | null>(null)

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const envOk = hasSupabaseEnv()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [taken, setTaken] = useState<TakenCourse[]>([])
  const [overrides, setOverrides] = useState<Override[]>([])

  const loadAll = useCallback(async () => {
    const [p, t, o] = await Promise.all([getProfile(), listTaken(), listOverrides()])
    setProfile(p)
    setTaken(t)
    setOverrides(o)
  }, [])

  useEffect(() => {
    let active = true
    async function init() {
      if (!envOk) {
        setLoading(false)
        return
      }
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!active) return
      if (!data.user) {
        router.replace('/login')
        return
      }
      setEmail(data.user.email ?? null)
      await loadAll()
      if (active) setLoading(false)
    }
    init()
    return () => {
      active = false
    }
  }, [envOk, router, loadAll])

  const refresh = useCallback(async () => {
    await loadAll()
  }, [loadAll])

  const saveProfile = useCallback(async (patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }))
    await upsertProfile(patch)
  }, [])

  const progress = useMemo(
    () => computeProgress(buildProgram(profile.plan, profile.geFramework), taken, overrides),
    [profile.plan, profile.geFramework, taken, overrides],
  )

  const value: AppDataValue = {
    envOk, loading, email, profile, taken, overrides, progress, refresh, saveProfile,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppData(): AppDataValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAppData ต้องใช้ภายใน AppDataProvider')
  return v
}
