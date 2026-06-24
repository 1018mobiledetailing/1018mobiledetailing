import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { FamilyProvider } from '@/contexts/FamilyContext'

export const metadata: Metadata = {
  title: 'HomeHQ',
  description: 'Family household management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HomeHQ',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <FamilyProvider>{children}</FamilyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
