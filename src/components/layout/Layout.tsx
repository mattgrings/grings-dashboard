import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import FloatingMenuButton from './FloatingMenuButton'
import GreenLedBackground from '../ui/GreenLedBackground'

export default function Layout() {
  return (
    <div className="min-h-[100dvh] bg-bg relative" style={{ paddingTop: 'var(--sat, 0px)' }}>
      <GreenLedBackground />
      <Sidebar />
      <div className="md:ml-[240px] transition-all duration-300 relative z-10">
        <Header />
        <main className="p-4 md:p-6 pb-28 md:pb-6">
          <Outlet />
        </main>
      </div>
      <FloatingMenuButton />
    </div>
  )
}
