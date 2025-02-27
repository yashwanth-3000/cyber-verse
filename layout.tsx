import "@/styles/globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "700"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Varti Studio</title>
        <meta name="description" content="Create habit challenges with friends" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

