import type { Metadata } from "next"

export const metadata: Metadata = {
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

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
