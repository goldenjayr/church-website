import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "../globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Divine Jesus Church",
  description: "A welcoming community of faith, hope, and love",
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
      <body className={inter.className}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G7074KW0ZZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G7074KW0ZZ');
          `}
        </Script>
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
