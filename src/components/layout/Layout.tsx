import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'
import GreenLedBackground from '../ui/GreenLedBackground'

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg relative">
      <GreenLedBackground />
      <Sidebar />
      <div className="md:ml-[240px] transition-all duration-300 relative z-10">
        <Header />
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
