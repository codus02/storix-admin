import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="admin-layout">
      <Sidebar />
      <section className="admin-content">{children}</section>
    </main>
  )
}
