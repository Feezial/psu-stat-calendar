import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const kanit = Kanit({
  variable: '--font-sans',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
})


export const metadata: Metadata = {
  title: 'PSU Stat Checker — เช็คหน่วยกิตหลักสูตรสถิติ',
  description: 'เช็ควิชาครบ/ขาด หลักสูตร วท.บ. สถิติ ม.อ. หาดใหญ่ ปรับปรุง 2564',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${kanit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
