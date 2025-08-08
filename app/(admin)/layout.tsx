import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.divinejesus.org'),
  alternates: {
    canonical: '/',
  },
  title: "Divine Jesus Church",
  description: "A welcoming community of faith, hope, and love",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Divine Jesus Church",
    description: "A welcoming community of faith, hope, and love",
    images: [
      {
        url: "https://cdn.jsdelivr.net/gh/goldenjayr/divinejesus-files/landscape_logo.png",
        width: 1200,
        height: 630,
        alt: "Divine Jesus Church",
      },
    ],
  },
  generator: 'v0.dev'
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
