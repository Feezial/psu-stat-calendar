import { AppDataProvider } from './_components/app-data'
import { AppShell } from './_components/app-shell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
      <AppShell>{children}</AppShell>
    </AppDataProvider>
  )
}
