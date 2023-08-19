/* eslint-disable react/function-component-definition */
import '@/styles/globals.css'
export const metadata = {
  title: 'UnTelevised Media',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
