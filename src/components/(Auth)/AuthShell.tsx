/** เปลือกพื้นหลังบรรยากาศของหน้า auth (login / config-missing) — navy glow + dot grid + การ์ดกลางจอ */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-24 -z-10 h-96 w-96 rounded-full bg-chart-3/10 blur-3xl"
      />
      <div
        aria-hidden
        className="auth-grid pointer-events-none absolute inset-0 -z-10 opacity-40"
      />
      <div className="w-full max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-700">
        <div className="relative overflow-hidden rounded-3xl bg-card p-7 shadow-xl shadow-primary/10 ring-1 ring-foreground/10 sm:p-8">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          />
          {children}
        </div>
      </div>
    </main>
  )
}
