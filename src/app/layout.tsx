import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'STORIX Admin',
  description: 'STORIX service operation console',
  icons: {
    icon: '/storix-logo-pink.svg',
    shortcut: '/storix-logo-pink.svg',
    apple: '/storix-logo-pink.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
