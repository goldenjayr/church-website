import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { NavigationOptimized } from "@/components/navigation-optimized"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { GoogleAnalytics } from '@next/third-parties/google' // Import GoogleAnalytics

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
        height: 1200,
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
      <head>
        <meta name="google-site-verification" content="9t1-nbqu6UmssVU8tnZ4r5YjUAG_vp0uahgZEKowXOs" />
      </head>
      <body className={inter.className}>
        <NavigationOptimized />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster />
      </body>
      <GoogleAnalytics gaId="G-G7074KW0ZZ" />
    </html>
  )
}
