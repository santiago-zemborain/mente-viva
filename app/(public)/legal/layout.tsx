import type React from "react"
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="px-4 py-16 sm:px-6 lg:px-8">{children}</div>
}
