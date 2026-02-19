import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: '바이브코딩 가이드 by growink',
  description: '바이브코딩 가이드 by growink - AI 기반 검색과 체계적인 카테고리 분류로 원하는 프롬프트를 빠르게 찾아보세요.',
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
