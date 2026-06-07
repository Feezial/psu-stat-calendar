import type { Metadata } from 'next'
import { Noto_Sans_Thai, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const notoThai = Noto_Sans_Thai({
  variable: '--font-sans',
  subsets: ['thai', 'latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PSU Stat Checker — เช็คหน่วยกิตหลักสูตรสถิติ',
  description: 'เช็ควิชาครบ/ขาด หลักสูตร วท.บ. สถิติ ม.อ. หาดใหญ่ ปรับปรุง 2564',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${notoThai.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
