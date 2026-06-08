import { AppDataProvider } from '@/contexts/app-data'
import { AppShell } from '@/components/(App)/app-shell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
      <AppShell>{children}</AppShell>
    </AppDataProvider>
  )
}
