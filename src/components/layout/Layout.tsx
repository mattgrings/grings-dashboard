import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'
import { useCursorGlow } from '../../hooks/useCursorGlow'

export default function Layout() {
  useCursorGlow()

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="md:ml-[240px] transition-all duration-300">
        <Header />
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
