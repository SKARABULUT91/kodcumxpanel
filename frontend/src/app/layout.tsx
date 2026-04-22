import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kodcum v2 | Dashboard',
  description: 'SNR ENGINE v2 - Profesyonel Otomasyon Paneli',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        {/* Favicon veya ek meta tagleri buraya gelebilir */}
      </head>
      <body className="bg-[#050505] antialiased">
        {children}
      </body>
    </html>
  )
}