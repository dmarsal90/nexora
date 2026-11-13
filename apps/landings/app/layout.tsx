import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nexora Preview',
  robots: { index: false, follow: false, noarchive: true },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
